import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { appConfig } from '../../config';
import { dynamodbTables } from '../../db/dynamodb';
import { DynamodbConstruct } from './aws-resources';

export class DynamodbStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dbConstruct = new DynamodbConstruct(scope, `${appConfig.env}DynamodbConstruct`);
    dbConstruct.createTables(this, dynamodbTables);
  }
}
