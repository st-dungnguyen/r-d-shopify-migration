import { AttributeType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';
import { BaseTableDefinition } from '../../common/types/dynamodb.types';
import { USERS_TABLE_NAME } from './tables';

export const usersTableDefinition = new BaseTableDefinition({
  name: USERS_TABLE_NAME,
  partitionKey: {
    name: 'id',
    type: AttributeType.STRING,
  },
  pointInTimeRecovery: true,
  indexes: [
    {
      partitionKey: {
        name: 'email',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.ALL,
    },
  ],
});
