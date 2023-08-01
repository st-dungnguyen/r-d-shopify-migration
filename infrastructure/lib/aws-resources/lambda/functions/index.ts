import { authenticateFunctions } from './authentication.functions';
import { authorizeFunction } from './authorization.functions';

export const lambdaFunctions = [...authenticateFunctions];
export { authorizeFunction };
