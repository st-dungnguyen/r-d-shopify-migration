#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RestApi, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import 'source-map-support/register';
import { appConfig } from '../../config';
import {
  ApigatewayConstruct,
  LambdaConstruct,
  apiResources,
  authorizeFunction,
  lambdaFunctions,
} from '../lib/aws-resources';

class DevelopmentStack extends cdk.Stack {
  restApi: RestApi;
  authorizer: TokenAuthorizer;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // Create API Gateway
    const apigatewayConstruct = new ApigatewayConstruct(this, `${appConfig.env}ApigatewayConstruct`);
    apigatewayConstruct.createApiGateway(this);

    // Create Lambda Functions
    const lambdaConstruct = new LambdaConstruct(this, `${appConfig.env}LambdaConstruct`);
    const funcs = lambdaConstruct.createLambdaFunctions(this, [authorizeFunction, ...lambdaFunctions]);

    // Create API Resources
    apigatewayConstruct.createApiAuthorizer(this);
    apigatewayConstruct.createApiResources(this, apiResources, funcs);
  }
}

const app = new cdk.App();
// Note: Stacks will be executed in A-Z order of stack id
new DevelopmentStack(app, 'DevelopmentStack', {
  env: {
    account: appConfig.profile.accountId,
    region: appConfig.profile.region,
  },
});
