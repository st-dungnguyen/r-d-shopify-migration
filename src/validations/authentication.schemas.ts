import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import ajvFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
ajvErrors(ajv);
ajvFormats(ajv);

export namespace AuthenticationSchema {
  export const validateLogin = () => {
    return ajv.compile({
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['email', 'password'],
    });
  };
}
