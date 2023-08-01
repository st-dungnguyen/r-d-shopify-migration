import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';

export type TableKey = {
  name: string;
  type: AttributeType;
};

export type GlobalSecondaryIndex = {
  partitionKey: TableKey;
  sortKey?: TableKey;
  projectionType: ProjectionType;
};

export interface TableDefinition {
  name: string;
  partitionKey: TableKey;
  sortKey?: TableKey;
  pointInTimeRecovery?: boolean;
  billingMode?: BillingMode;
  removalPolicy?: RemovalPolicy;
  indexes?: GlobalSecondaryIndex[];
}

export enum DynamodbPermission {
  READ,
  WRITE,
  READ_WRITE,
  FULL,
  INDEX,
}

export class BaseTableDefinition implements TableDefinition {
  name: string;
  partitionKey: TableKey;
  sortKey?: TableKey;
  pointInTimeRecovery?: boolean;
  billingMode?: BillingMode
  removalPolicy?: RemovalPolicy
  indexes?: GlobalSecondaryIndex[];

  constructor(data: TableDefinition) {
    this.name = data.name;
    this.partitionKey = data.partitionKey;
    this.sortKey = data.sortKey;
    this.pointInTimeRecovery = data.pointInTimeRecovery;
    this.billingMode = data.billingMode || BillingMode.PAY_PER_REQUEST;
    this.removalPolicy = data.removalPolicy || RemovalPolicy.RETAIN;
    this.indexes = data.indexes || []; 
  }
}
