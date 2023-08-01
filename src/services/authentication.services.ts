import { compare } from 'bcryptjs';
import { QueryByGsiParams } from '../../common/helpers/dynamodb.helpers';
import { CommonError } from '../../common/helpers/error.helpers';
import { DateUtils } from '../../common/utils/date.utils';
import { JwtUtils } from '../../common/utils/jwt.utils';
import { appConfig } from '../../config';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repositories';
import { AuthenticationSchema } from '../validations/authentication.schemas';
import { AppServices } from './app.services';

interface AuthenticationServicesMethods {
  call(body: any): Promise<any>;
}

export class AuthenticationServices extends AppServices implements AuthenticationServicesMethods {
  userRepository: UserRepository;

  constructor() {
    super();
    this.userRepository = new UserRepository();
  }

  async call(event: any): Promise<any> {
    // Format params
    const email = event.body.email?.toLowerCase();
    const password = event.body.password;

    const validate = AuthenticationSchema.validateLogin();
    if (!validate({ email, password })) {
      throw CommonError.BAD_REQUEST(this.ajv.errorsText(validate.errors));
    }

    const params: QueryByGsiParams = {
      partialKey: {
        name: 'email',
        value: email.toLowerCase(),
      },
      sort: 'createdAt_desc',
      indexName: 'emailIndex',
      filters: [
        {
          key: 'deactivatedAt',
          value: null,
          condition: 'attribute_not_exists',
        },
      ],
    };

    const result = await this.userRepository.listByGSI(params);
    if (result?.items?.length) {
      const user: User = result.items[0];
      const match = await compare(password, user.password);
      if (match) {
        const accessToken = JwtUtils.generateJWT(
          {
            user: {
              userId: user.id,
              email: user.email,
            },
          },
          appConfig.jwtSecretKey
        );

        const refreshToken = JwtUtils.generateJWT({ user: { userId: user.id } }, appConfig.jwtSecretKey, '8h');

        // Last login tracking
        user.lastLoginAt = DateUtils.today();
        await this.userRepository.save(user);

        return {
          accessToken,
          refreshToken,
          id: user.id,
          username: user.username,
          email: user.email,
        };
      }
      throw CommonError.UNAUTHORIZED();
    }
    throw CommonError.UNAUTHORIZED();
  }
}
