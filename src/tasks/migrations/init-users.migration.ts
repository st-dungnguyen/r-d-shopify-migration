import Ajv from 'ajv';
import { genSaltSync, hashSync } from 'bcryptjs';
import { CommonError } from '../../../common/helpers/error.helpers';
import { LogLevel, Logger } from '../../../common/helpers/logger.helpers';
import { User } from '../../entities/user.entity';
import { UserCreateServices } from '../../services/users/create.services';
import { UserSchema } from '../../validations/user.schemas';

const handler = async () => {
  const logger = new Logger();
  logger.log(LogLevel.INFO, 'Executing Task', {});
  const userCreateServices = new UserCreateServices();
  const input = new User({
    username: 'Admin',
    email: 'admin@dummy.com',
    password: hashSync('123456', genSaltSync()),
  });

  const ajv = new Ajv();
  const validate = UserSchema.validateCreateParams();
  if (!validate(input)) {
    console.log(ajv.errorsText(validate.errors));
    throw CommonError.BAD_REQUEST(ajv.errorsText(validate.errors));
  }

  const result = await userCreateServices.create(input);
  logger.log(LogLevel.INFO, 'Finish Task', result);
};

handler();
