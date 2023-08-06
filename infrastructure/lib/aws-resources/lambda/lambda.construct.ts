import { Duration } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { appConfig } from '../../../../config';
import { getParameter, putParameter } from '../ssm/ssm.utils';
import { LambdaFunction } from './lambda.helpers';

export class LambdaConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  createLambdaFunctions(scope: Construct, functions: LambdaFunction[]) {
    const defaultEnvironments = {
      ENVIRONMENT: process.env.ENVIRONMENT || 'dev',
      REST_API_ID: getParameter(scope, appConfig.ssm.restApiId),
      SHOPIFY_ACCESS_TOKEN: appConfig.shopify.accessToken,
    };
    // Create Lambda Function
    const result: { [key: string]: NodejsFunction } = {};
    functions.map((func: LambdaFunction) => {
      const lambda = new NodejsFunction(this, func.functionName, {
        entry: func.entry,
        handler: func.handler,
        functionName: func.functionName,
        runtime: func.runtime,
        timeout: Duration.seconds(func.timeout || 30),
        memorySize: func.memorySize,
        environment: { ...defaultEnvironments, ...func.environment },
        bundling: {
          target: 'es2020',
          sourceMap: true,
          sourceMapMode: SourceMapMode.INLINE,
          minify: false,
        },
      });

      // Adding custom policies
      func.customPolicies?.map((policy: PolicyStatement) => {
        lambda.addToRolePolicy(policy);
      });

      // Put Lambda Function ARN to SSM Parameters Store
      if (func.ssm) {
        putParameter(scope, func.ssm, lambda.functionArn);
        result[func.ssm] = lambda;
      }
    });
    return result;
  }
}
