import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { appConfig } from '../../config';
import { ApigatewayConstruct, apiResources } from './aws-resources';

export class ApigatewayStack extends Stack {
  apigatewayConstruct: ApigatewayConstruct;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.apigatewayConstruct = new ApigatewayConstruct(this, `${appConfig.env}ApigatewayConstruct`);
    this.apigatewayConstruct.loadParameters(this);
    this.apigatewayConstruct.loadApiGateway(
      this,
      this.apigatewayConstruct.ssmParams.restApiId,
      this.apigatewayConstruct.ssmParams.rootResourceId
    );
    this.apigatewayConstruct.createApiResources(this, apiResources);
  }
}
