import { HttpMethods } from '../../../../common/types/http.types';
import { LambdaFunction } from '../lambda';

export interface ApigatewayResourceProps {
  path: string;
  funcs: LambdaFunction[];
  allowOrigin?: string[];
  allowMethods?: HttpMethods[];
  allowHeaders?: string[];
}

export class ApigatewayResource implements ApigatewayResourceProps {
  path: string;
  funcs: LambdaFunction[];
  allowOrigin?: string[];
  allowMethods?: HttpMethods[];
  allowHeaders?: string[];

  constructor(data: ApigatewayResourceProps) {
    this.path = data.path;
    this.funcs = data.funcs;
    this.allowOrigin = data.allowOrigin || ['*'];
    this.allowMethods = data.allowMethods || ['OPTIONS', 'GET', 'PUT', 'POST', 'DELETE', 'PATCH'];
    this.allowHeaders = data.allowHeaders || ['Content-Type', 'Authorization'];
  }
}
