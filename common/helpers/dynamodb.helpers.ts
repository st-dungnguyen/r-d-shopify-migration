import { DocumentClient, TransactWriteItem } from 'aws-sdk/clients/dynamodb';
import { ArrayUtils } from '../../common/utils/array.utils';
import { appConfig } from '../../config';
import { CommonError } from './error.helpers';

export type QueryByGsiParams = {
  partialKey: {
    name: string;
    value: string;
  };
  indexName: string;
  sort?: string;
  marker?: string;
  pageSize?: number;
  all?: boolean;
  withDeleted?: boolean;
  filters?: {
    key: string;
    value: any;
    condition: 'attribute_not_exists' | 'in' | '=' | '<>' | 'contains';
  }[];
};

export class DynamoDB {
  static documentClient: DocumentClient = new DocumentClient({
    apiVersion: appConfig.dynamodb.apiVersion,
    region: appConfig.dynamodb.region,
    endpoint: appConfig.dynamodb.endpoint,
  });

  static async scan(
    tableName: string,
    filter?: string,
    expressionAttributeNames?: { [key: string]: string },
    expressionAttributeValues?: { [key: string]: any },
    projectionExpression?: string
  ): Promise<any> {
    const params: DocumentClient.ScanInput = {
      TableName: tableName,
      FilterExpression: filter,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ProjectionExpression: projectionExpression,
    };
    const items = [];
    let response: any;
    do {
      try {
        response = await this.documentClient.scan(params).promise();
        if (response.Items?.length) {
          items.push(...response.Items);
        }
        params.ExclusiveStartKey = response.LastEvaluatedKey;
      } catch (error) {
        throw CommonError.INTERNAL_SERVER_ERROR(error);
      }
    } while (response.LastEvaluatedKey);
    return items;
  }

  static async save(tableName: string, item: any): Promise<any> {
    const params: DocumentClient.PutItemInput = {
      TableName: tableName,
      Item: item,
    };
    try {
      const result = await this.documentClient.put(params).promise();
      return result;
    } catch (error) {
      throw CommonError.INTERNAL_SERVER_ERROR(error);
    }
  }

  static async find(tableName: string, key: any): Promise<any> {
    const params: DocumentClient.GetItemInput = {
      TableName: tableName,
      Key: key,
    };
    try {
      const response = await this.documentClient.get(params).promise();
      return response.Item;
    } catch (error) {
      throw CommonError.INTERNAL_SERVER_ERROR(error);
    }
  }

  static async delete(tableName: string, key: any): Promise<any> {
    const params: DocumentClient.DeleteItemInput = {
      TableName: tableName,
      Key: key,
    };
    try {
      const response = await this.documentClient.delete(params).promise();
      return response.Attributes;
    } catch (error) {
      throw CommonError.INTERNAL_SERVER_ERROR(error);
    }
  }

  static async query(
    tableName: string,
    expressionAttributeNames: { [key: string]: string },
    expressionAttributeValues: { [key: string]: any },
    keyConditionExpression: string,
    indexName: string,
    pageSize?: number,
    filter?: string,
    scanIndexForward?: boolean,
    lastEvaluatedKey?: undefined | DocumentClient.Key,
    all?: boolean
  ): Promise<any> {
    let params: DocumentClient.QueryInput = {
      TableName: tableName,
      IndexName: indexName,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      KeyConditionExpression: keyConditionExpression,
      ScanIndexForward: scanIndexForward,
    };
    if (filter) {
      params.FilterExpression = filter;
    }
    const items: DocumentClient.ItemList = [];
    let response: DocumentClient.QueryOutput = {};
    do {
      try {
        response = await this.documentClient
          .query({
            ...params,
            ExclusiveStartKey: lastEvaluatedKey,
          })
          .promise();
        if (response.Items) {
          items.push(...response.Items);
        }
        lastEvaluatedKey = response.LastEvaluatedKey;
      } catch (error) {
        throw CommonError.INTERNAL_SERVER_ERROR(error);
      }
    } while (pageSize ? items.length < pageSize && lastEvaluatedKey : lastEvaluatedKey && all);
    if (pageSize) return items.slice(0, pageSize);
    return items;
  }

  static async batchGetItem(tableName: string, key: string, values: string[]): Promise<any> {
    const chunks = ArrayUtils.chunk(values, 100);
    let items: any = [];
    await Promise.all(
      chunks.map(async (keys: string[]) => {
        const params = {
          RequestItems: {
            [tableName]: {
              Keys: keys.map((value: string) => ({
                [key]: value,
              })),
            },
          },
        };
        const response = await this.documentClient.batchGet(params).promise();
        if (response.Responses?.[tableName]?.length) {
          items.push(...response.Responses?.[tableName]);
        }
      })
    );
    return items;
  }

  static async transactWrite(transactItems: TransactWriteItem[], limit: number = 24): Promise<void> {
    if (transactItems.length === 0) return;
    const chunkedItems: TransactWriteItem[][] = ArrayUtils.chunk(transactItems, limit);
    await Promise.all(
      chunkedItems.map(async (item: TransactWriteItem[]) => {
        const params: DocumentClient.TransactWriteItemsInput = {
          TransactItems: [...item],
        };
        await this.documentClient.transactWrite(params).promise();
      })
    );
  }
}
