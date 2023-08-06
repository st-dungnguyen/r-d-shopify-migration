/*
 * This file is used to test create a new bulk operation mutation
 * Command: ts-node src/lib/migrations/create-bulk-operation.ts
*/

import { ShopifyServices } from "../../services/shopify.services";

// Specify the GraphQL mutation
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

const filePath = 'src/lib/migrations/data/customers.jsonl';

class BulkOperation {
  shopifyService: ShopifyServices;

  constructor() {
    this.shopifyService = new ShopifyServices();
  }

  async run() {
    // Uploading file to the Shopify
    const uploadedFile = await this.shopifyService.uploadFileToShopify(filePath);

    if (uploadedFile?.key && uploadedFile?.fileUploadedOutput) {
      const clientIdentifier = `dummy_${Date.now()}`;
      const output = await this.shopifyService.bulkOperationRunMutation(
        clientIdentifier,
        mutation,
        uploadedFile?.key
      );
      console.log(new Date(), 'BulkOperation ID: ', output?.id);
    } else {
      console.error('Failed');
    }
  }
}

const main = async () => {
  const operation = new BulkOperation();
  await operation.run();
};

main();
