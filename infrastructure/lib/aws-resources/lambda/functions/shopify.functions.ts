import { LambdaFunction } from '../lambda.helpers';

const bulkMutationFunction = new LambdaFunction({
  functionName: 'BulkOperationMutation',
  entry: 'shopify',
  handler: 'createBulkOperation',
  timeout: 900,
  environment: {},
  apiResourceMethod: 'POST',
  apiResourcePath: 'shopify',
});

export const shopifyFunctions = [bulkMutationFunction];
