import { AuthorizationType, MethodOptions, MethodResponse, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway';

const responseParameters: any = {
  'method.response.header.Access-Control-Allow-Headers': true,
  'method.response.header.Access-Control-Allow-Methods': true,
  'method.response.header.Access-Control-Allow-Origin': true,
  'method.response.header.Cache-Control': true,
  'method.response.header.X-Frame-Options': true,
};

const methodResponses: MethodResponse[] = [
  {
    statusCode: '200',
    responseParameters,
  },
  {
    statusCode: '400',
    responseParameters,
  },
  {
    statusCode: '401',
    responseParameters,
  },
  {
    statusCode: '403',
    responseParameters,
  },
  {
    statusCode: '404',
    responseParameters,
  },
  {
    statusCode: '500',
    responseParameters,
  },
];

export const getMethodOptionsNoAuth = (): MethodOptions => {
  return {
    methodResponses: methodResponses,
  };
};

export const getMethodOptionsWithAuth = (apiAuthorizer: TokenAuthorizer): MethodOptions => {
  return {
    methodResponses: methodResponses,
    authorizationType: AuthorizationType.CUSTOM,
    authorizer: apiAuthorizer,
  };
};
