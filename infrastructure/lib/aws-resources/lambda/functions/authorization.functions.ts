import { DynamodbPermission, LambdaFunction, USERS_TABLE_NAME } from '../lambda.helpers';

export const authorizeFunction = new LambdaFunction({
  functionName: 'ApiAuthorizer',
  entry: 'authorization',
  handler: 'create',
  memorySize: 256,
  dynamodbTables: {
    [USERS_TABLE_NAME]: [DynamodbPermission.READ_WRITE, DynamodbPermission.INDEX],
  },
});
