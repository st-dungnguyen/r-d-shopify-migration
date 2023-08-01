import * as util from 'util';
import { DateUtils } from '../utils/date.utils';

export enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  DEBUG = 'debug',
}

export class Logger {
  log(level: LogLevel, message: string, payload: any) {
    console[level](DateUtils.today, message, util.inspect(payload, true, Infinity, false));
  }
}
