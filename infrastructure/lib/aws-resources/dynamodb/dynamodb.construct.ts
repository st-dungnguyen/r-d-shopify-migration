import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { BaseTableDefinition, GlobalSecondaryIndex } from '../../../../common/types/dynamodb.types';
import { TxtUtils } from '../../../../common/utils/txt.utils';
import { appConfig } from '../../../../config';

export class DynamodbConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  createTables(scope: Construct, tables: BaseTableDefinition[]) {
    tables.map((table: BaseTableDefinition) => {
      const dTable = new Table(scope, `${appConfig.env}${table.name}`, {
        tableName: table.name,
        partitionKey: table.partitionKey,
        sortKey: table.sortKey,
        pointInTimeRecovery: table.pointInTimeRecovery,
        billingMode: table.billingMode,
        removalPolicy: table.removalPolicy,
      });

      table.indexes?.map((index: GlobalSecondaryIndex) => {
        let indexName = `${index.partitionKey.name}Index`;
        if (index.sortKey) {
          indexName = `${index.sortKey.name}${TxtUtils.capitalizeFirstLetter(indexName)}`;
        }
        dTable.addGlobalSecondaryIndex({
          indexName,
          ...index,
        });
      });
    });
  }
}
