import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import ajvFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
ajvErrors(ajv);
ajvFormats(ajv);

export namespace UserSchema {
  export const validateCreateParams = () => {
    return ajv.compile({
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        username: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['email','username', 'password'],
    });
  };
}
