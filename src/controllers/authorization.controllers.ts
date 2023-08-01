import { appConfig } from '../../config';
import { AuthorizationServices } from '../services/authorization.services';

export interface PolicyStatement {
  Action: string;
  Effect: string;
  Resource: string[];
}

export interface PolicyDocument {
  Version: string;
  Statement: PolicyStatement[];
}

export interface PolicyOutput {
  principalId: number;
  policyDocument: PolicyDocument;
  context: any;
}

const restApiId = process.env.REST_API_ID;
const resourceBase = `arn:aws:execute-api:${appConfig.profile.region}:${appConfig.profile.accountId}:${restApiId}/*`;

const policyStatement = (effect: string): PolicyStatement => {
  return {
    Action: '*',
    Effect: effect,
    Resource: [],
  };
};

const authorizationServices = new AuthorizationServices();

export const create = async (event: any, context: any, callback: any): Promise<any> => {
  try {
    var verifyData = await authorizationServices.authorize(event.authorizationToken);
    return {
      principalId: 1,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [policyStatement('Allow')],
      },
      context: {
        id: verifyData.id,
      },
    };
  } catch (error: any) {
    callback('Unauthorized');
    return;
  }
};
