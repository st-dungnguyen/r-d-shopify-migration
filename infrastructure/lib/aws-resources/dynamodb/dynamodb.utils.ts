import { ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { BaseTableDefinition } from '../../../../common/types/dynamodb.types';
import { appConfig } from '../../../../config';
import { dynamodbTables } from '../../../../db/dynamodb';

export const getDynamodbTables = (scope: Construct) => {
  const tables: { [key: string]: { table: ITable; policy: PolicyStatement } } = {};
  [...dynamodbTables].map((table: BaseTableDefinition) => {
    const tb = Table.fromTableName(scope, `${appConfig.env}${table.name}`, table.name);
    tables[table.name] = {
      table: tb,
      policy: new PolicyStatement({
        actions: ['dynamodb:Query'],
        resources: [`${tb!.tableArn}/index/*`],
      }),
    };
  });

  return tables;
};
