import { request, response } from '../../../../common/utils/http.utils';
import { ShopifyServices } from '../../../services/shopify.services';

const shopifyServices = new ShopifyServices();

export const create = request(async (event: any, _context: any) => {
  const { mutation, filePath } = event.body;

  const uploaded = await shopifyServices.uploadFileToShopify(filePath);
  if (uploaded?.key && uploaded?.fileUploadedOutput) {
    console.log(new Date(), 'Create Bulk Operation');
    const clientIdentifier = `dummy_${Date.now()}`;
    const output = await shopifyServices.bulkOperationRunMutation(clientIdentifier, mutation, uploaded?.key);
    console.log(new Date(), 'BulkOperation ID: ', output?.id);
    return response(output);
  }
  return response({});
});
