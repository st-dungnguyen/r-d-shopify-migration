import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { appConfig } from '../../config';
import { ApigatewayConstruct } from './aws-resources';

export class BaseStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const apigatewayConstruct = new ApigatewayConstruct(this, `${appConfig.env}ApigatewayConstruct`);
    apigatewayConstruct.createApiGateway(this);
    apigatewayConstruct.createAuthenticationLambda(this);
  }
}
