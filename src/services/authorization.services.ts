import { QueryByGsiParams } from '../../common/helpers/dynamodb.helpers';
import { CommonError } from '../../common/helpers/error.helpers';
import { JwtUtils } from '../../common/utils/jwt.utils';
import { appConfig } from '../../config';
import { UserRepository } from '../repositories/user.repositories';
import { AppServices } from './app.services';

interface AuthorizationServicesMethods {
  authorize(access_token: string): Promise<any>;
}

export class AuthorizationServices extends AppServices implements AuthorizationServicesMethods {
  userRepository: UserRepository;

  constructor() {
    super();
    this.userRepository = new UserRepository();
  }

  async authorize(access_token: string): Promise<any> {
    const [type, token] = access_token!.split(' ');
    if (type !== 'Bearer' || !token) {
      throw CommonError.INTERNAL_SERVER_ERROR('Invalid Token');
    }
    const data = JwtUtils.verifyJWT(token, appConfig.jwtSecretKey);
    const {
      user: { email },
    }: any = data;

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

    const users = await this.userRepository.listByGSI(params);
    if (users?.items?.length) {
      return data;
    }
    throw CommonError.UNAUTHORIZED();
  }
}
