import { DynamodbPermission, LambdaFunction, USERS_TABLE_NAME } from '../lambda.helpers';

const loginFunction = new LambdaFunction({
  functionName: 'Login',
  entry: 'authentication',
  handler: 'create',
  memorySize: 256,
  environment: {},
  dynamodbTables: {
    [USERS_TABLE_NAME]: [DynamodbPermission.READ_WRITE, DynamodbPermission.INDEX],
  },
  apiResourceMethod: 'POST',
  apiResourcePath: '/login',
});

export const authenticateFunctions = [loginFunction];
