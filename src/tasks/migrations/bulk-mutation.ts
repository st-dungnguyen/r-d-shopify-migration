import { ShopifyServices } from '../../services/shopify.services';

const mutation = `
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      userErrors {
        field
        message
      }
    }
  }
`;
const filePath = 'src/tasks/migrations/data.jsonl';

class BulkMutation {
  shopifyServices: ShopifyServices;
  constructor() {
    this.shopifyServices = new ShopifyServices();
  }

  async bulkMutation() {
    const uploaded = await this.shopifyServices.uploadFileToShopify(filePath);
    if (uploaded?.key && uploaded?.fileUploadedOutput) {
      console.log(new Date(), 'Create Bulk Operation');
      const clientIdentifier = `dummy_${Date.now()}`;
      const output = await this.shopifyServices.bulkOperationRunMutation(clientIdentifier, mutation, uploaded?.key);
      console.log(new Date(), 'BulkOperation ID: ', output?.id);
      return output;
    }
    return;
  }
}

const main = async () => {
  const bm = new BulkMutation();
  await bm.bulkMutation();
};

main();
