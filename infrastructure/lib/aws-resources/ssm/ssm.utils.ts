import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export function putParameter(scope: Construct, key: string, value: string): StringParameter {
  return new StringParameter(scope, `${key}Param`, {
    parameterName: key,
    stringValue: value,
  });
}

export function getParameter(scope: Construct, key: string) {
  return StringParameter.valueForStringParameter(scope, key);
}

export const ssm = { putParameter, getParameter };
