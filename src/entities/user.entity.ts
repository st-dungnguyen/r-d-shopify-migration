import { USERS_TABLE_NAME } from '../../db/dynamodb/tables';
import { BaseEntity, BaseProps } from './base.entity';

export interface UserProps extends BaseProps {
  username: string;
  email: string;
  password: string;
  deactivatedAt?: string;
  lastLoginAt?: string;
}

export class User extends BaseEntity implements UserProps {
  static tableName = USERS_TABLE_NAME;

  username: string;
  email: string;
  password: string;
  deactivatedAt?: string;
  lastLoginAt?: string;

  constructor(data: UserProps) {
    super({ ...data });
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.deactivatedAt = data.deactivatedAt;
    this.lastLoginAt = data.lastLoginAt;
  }
}
