import { statusCode } from '../utils/http.utils';

export class BaseError extends Error {
  statusCode: number;
  internalMessage?: any;

  constructor(code: number, message: string, internalMessage?: any) {
    super(message);
    this.statusCode = code;
    this.internalMessage = internalMessage;
  }

  toError = () => {
    return {
      statusCode: this.statusCode,
      body: JSON.stringify({
        code: this.statusCode,
        message: this.message,
      }),
    };
  };
}

export namespace CommonError {
  export const UNAUTHORIZED = (internalMessage?: any) => {
    return new BaseError(statusCode.HTTP_UNAUTHORIZED, 'Unauthorized', internalMessage);
  };

  export const INTERNAL_SERVER_ERROR = (internalMessage?: any) => {
    return new BaseError(statusCode.HTTP_INTERNAL_SERVER, 'Internal server error', internalMessage);
  };

  export const PERMISSION_DENIED = () => {
    return new BaseError(statusCode.PERMISSION_DENIED, 'Access Denied');
  };

  export const BAD_REQUEST = (message: string, internalMessage?: any) => {
    return new BaseError(statusCode.HTTP_BAD_REQUEST, message, internalMessage);
  };

  export const NOT_FOUND = (model: string) => {
    return new BaseError(statusCode.HTTP_NOT_FOUND, `${model} not found`);
  };
}
