import { CommonError } from '../../../common/helpers/error.helpers';
import { User, UserProps } from '../../entities/user.entity';
import { UserSchema } from '../../validations/user.schemas';
import { UserServices } from '../user.services';

interface UserCreateServicesMethods {
  create(data: UserProps): Promise<User>;
}

export class UserCreateServices extends UserServices implements UserCreateServicesMethods {
  constructor() {
    super();
  }

  async create(data: UserProps): Promise<User> {
    // Validate input params
    const validate = UserSchema.validateCreateParams();
    if (!validate(data)) {
      throw CommonError.BAD_REQUEST(this.ajv.errorsText(validate.errors));
    }
    // Save data if validation is passed
    try {
      const result = await this.userRepository.save(new User(data));
      return result;
    } catch (error) {
      throw CommonError.INTERNAL_SERVER_ERROR(error);
    }
  }
}
