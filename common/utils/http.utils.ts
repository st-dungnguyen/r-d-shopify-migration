import { BaseError, CommonError } from '../helpers/error.helpers';
import { Logger } from './logger.utils';

export const statusCode = {
  HTTP_OK: 200,
  HTTP_BAD_REQUEST: 400,
  HTTP_UNAUTHORIZED: 401,
  PERMISSION_DENIED: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_INTERNAL_SERVER: 500,
};

export const response = (body: any, code: number = statusCode.HTTP_OK) => {
  return {
    statusCode: code,
    body: JSON.stringify(body),
  };
};

export const request =
  (handler: (event: any, context: any, callback: any) => Promise<any>): any =>
  async (event: any, context: any, callback: any) => {
    Logger.log(Logger.LogLevel.DEBUG, 'Input Params', event);
    try {
      if (event.body) {
        event.body = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
      }
      const result = await handler({ ...event } as any, context, callback);
      return result as any;
    } catch (error) {
      if (error instanceof BaseError) {
        if (error.internalMessage) {
          Logger.log(Logger.LogLevel.ERROR, 'Internal Server Error!', error.internalMessage);
        }
        return error.toError();
      }
      Logger.log(Logger.LogLevel.ERROR, 'External Server Error!', error);
      return CommonError.INTERNAL_SERVER_ERROR().toError();
    }
  };
