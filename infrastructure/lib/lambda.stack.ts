import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { appConfig } from '../../config';
import { lambdaFunctions } from './aws-resources';
import { LambdaConstruct } from './aws-resources';

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const lambdaConstruct = new LambdaConstruct(this, `${appConfig.env}LambdaConstruct`);
    lambdaConstruct.createLambdaFunctions(this, lambdaFunctions);
  }
}
