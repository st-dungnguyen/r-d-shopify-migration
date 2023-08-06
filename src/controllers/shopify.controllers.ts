import { request, response } from '../../common/utils/http.utils';
import { ShopifyServices } from '../services/shopify.services';

const shopifyServices = new ShopifyServices();

export const createBulkOperation = request(async (event: any, _context: any) => {
  const { mutation, filePath } = event.body;
  const result = await shopifyServices.createBulkOperation(mutation, filePath);
  return response(result);
});
