import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DynamoDB, QueryByGsiParams } from '../../common/helpers/dynamodb.helpers';
import { TxtUtils } from '../../common/utils/txt.utils';
import { User } from '../entities/user.entity';

export interface UserRepositoryMethods {
  all(): Promise<User[]>;
  find(id: string): Promise<User | undefined>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<string>;
  listByGSI(data: QueryByGsiParams): Promise<any>;
}

export class UserRepository implements UserRepositoryMethods {
  async all(): Promise<User[]> {
    const result = await DynamoDB.scan(User.tableName);
    return result.map((res: any) => {
      return new User(res);
    });
  }

  async find(id: string): Promise<User | undefined> {
    const result = await DynamoDB.find(User.tableName, { id });
    if (result) {
      return new User(result);
    }
    return undefined;
  }

  async save(user: User): Promise<User> {
    await DynamoDB.save(User.tableName, user);
    return user;
  }

  async delete(id: string): Promise<string> {
    await DynamoDB.delete(User.tableName, { id });
    return id;
  }

  async listByGSI(data: QueryByGsiParams): Promise<any> {
    let { partialKey, indexName, sort, pageSize, all, marker, withDeleted, filters } = data;
    const expressionAttributeNames: { [key: string]: any } = { '#key': partialKey.name };
    const expressionAttributeValues: { [key: string]: any } = { ':value': partialKey.value };
    const keyConditionExpression = '#key = :value';
    const filter: string[] = [];
    let scanIndexForward: boolean = true;
    let reverse: boolean = false;
    let lastEvaluatedKey: undefined | DocumentClient.Key;
    let sortKey: string | undefined;
    let order: string | undefined;

    // Sort data options
    if (sort && sort.match(/^\w+_(asc|desc)$/)) {
      [sortKey, order] = sort.split('_');
      if (order === 'desc') {
        scanIndexForward = false;
      }
      indexName = `${sortKey}${TxtUtils.capitalizeFirstLetter(partialKey.name)}Index`;
    }

    // Remove deleted records
    if (!withDeleted) {
      expressionAttributeNames['#deletedAt'] = 'deletedAt';
      expressionAttributeValues[':null'] = null;
      filter.push('(attribute_not_exists(#deletedAt) OR #deletedAt = :null)');
    }

    // Handle filters
    if (filters?.length) {
      filters.map((f: { key: string; value: any; condition: string }) => {
        expressionAttributeNames[`#${f.key}`] = f.key;
        expressionAttributeValues[`:${f.key}`] = f.value;
        if (['attribute_not_exists'].includes(f.condition)) {
          filter.push(`${f.condition}(#${f.key}) OR #${f.key} = :${f.key}`);
        } else {
          filter.push(`#${f.key} ${f.condition} :${f.key}`);
        }
      });
    }

    // Paginate
    if (marker) {
      reverse = marker[0] === '-';
      lastEvaluatedKey = JSON.parse(TxtUtils.decodeBase64(reverse ? marker.substr(1) : marker));
    }

    let result = await DynamoDB.query(
      User.tableName,
      expressionAttributeNames,
      expressionAttributeValues,
      keyConditionExpression,
      indexName,
      pageSize,
      filter.join(' AND '),
      reverse ? !scanIndexForward : scanIndexForward,
      lastEvaluatedKey,
      all
    );

    let items = result.map((res: any) => {
      return new User(res);
    });

    if (reverse) items = items.reverse();
    let meta: any = {};
    if (items.length == pageSize) {
      const lastItems: any = items[items.length - 1];
      const mark: { [key: string]: any } = {
        id: lastItems.id,
        [partialKey.name]: partialKey.value,
      };
      if (sortKey) {
        mark[sortKey] = lastItems[sortKey];
      }
      meta['after'] = TxtUtils.encodeBase64(JSON.stringify(mark));
    }

    if (lastEvaluatedKey) {
      const firstItems: any = items[0];
      if (firstItems) {
        const mark: { [key: string]: any } = {
          id: firstItems.id,
          [partialKey.name]: partialKey.value,
        };
        if (sortKey) mark[sortKey] = firstItems[sortKey];
        meta['before'] = TxtUtils.encodeBase64(JSON.stringify(mark));
      }
      if (items.length == 0) {
        meta['after'] = null;
        if (reverse) {
          meta['before'] = null;
        }
      }
    }
    return { items, meta };
  }
}
