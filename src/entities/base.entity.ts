import { v4 as uuidv4 } from 'uuid';
import { DateUtils } from '../../common/utils/date.utils';

export interface BaseProps {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export class BaseEntity implements BaseProps {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;

  constructor(data: BaseProps) {
    this.id = data.id || uuidv4();
    this.createdAt = data.createdAt || DateUtils.today();
    this.updatedAt = data.updatedAt || DateUtils.today();
    this.deletedAt = data.deletedAt;
  }
}
