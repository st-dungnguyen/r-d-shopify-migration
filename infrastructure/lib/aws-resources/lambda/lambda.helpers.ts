import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { HttpMethods } from '../../../../common/types/http.types';
import { appConfig } from '../../../../config';

type FunctionMemorySize = 128 | 256 | 512 | 1024;

export interface LambdaFunctionProps {
  functionName: string;
  entry: string;
  handler?: string;
  runtime?: Runtime;
  timeout?: number;
  memorySize?: FunctionMemorySize;
  environment?: {
    [key: string]: string;
  };
  ssm?: string;
  customPolicies?: PolicyStatement[];
  auth?: boolean;
  apiResourcePath?: string;
  apiResourceMethod?: HttpMethods;
}

export class LambdaFunction implements LambdaFunctionProps {
  functionName: string;
  entry: string;
  handler?: string;
  runtime?: Runtime;
  timeout?: number;
  memorySize?: FunctionMemorySize;
  environment?: {
    [key: string]: string;
  };
  ssm?: string;
  customPolicies?: PolicyStatement[];
  auth?: boolean;
  apiResourcePath?: string;
  apiResourceMethod?: HttpMethods;

  constructor(data: LambdaFunctionProps) {
    this.functionName = `${appConfig.env}${data.functionName}Function`;
    this.entry = `src/controllers/${data.entry}.controllers.ts`;
    this.handler = data.handler || 'handler';
    this.runtime = data.runtime || Runtime.NODEJS_18_X;
    this.timeout = data.timeout || 30;
    this.memorySize = data.memorySize || 128;
    this.environment = data.environment;
    this.ssm = data.ssm ? `${appConfig.env}${data.ssm}` : `${this.functionName}`;
    this.customPolicies = data.customPolicies;
    this.auth = data.auth;
    this.apiResourcePath = data.apiResourcePath;
    this.apiResourceMethod = data.apiResourceMethod;
  }
}
