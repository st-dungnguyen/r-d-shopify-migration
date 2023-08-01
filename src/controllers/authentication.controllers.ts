import { request, response } from '../../common/utils/http.utils';
import { AuthenticationServices } from '../services/authentication.services';

const authenticationServices = new AuthenticationServices();

export const create = request(async (event, _context) => {
  const result = await authenticationServices.call(event);
  return response(result);
});
