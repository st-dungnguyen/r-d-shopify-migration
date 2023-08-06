import FormData from 'form-data';
import * as fs from 'fs';
import { BaseError } from '../../common/helpers/error.helpers';
import { Logger } from '../../common/utils/logger.utils';
import { AppServices } from './app.services';

export class ShopifyServices extends AppServices {
  constructor() {
    super();
  }

  async stagedUploadsCreate(fileName: string): Promise<any> {
    Logger.log(Logger.LogLevel.DEBUG, 'stagedUploadsCreate', fileName);
    const query = `
        mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
          stagedUploadsCreate(input: $input) {
            stagedTargets {
              url
              resourceUrl
              parameters {
                name
                value
              }
            }
            userErrors {
              field
              message
            }
          }
        }
    `;
    const variables = {
      input: {
        resource: 'BULK_MUTATION_VARIABLES',
        filename: fileName,
        mimeType: 'text/jsonl',
        httpMethod: 'POST',
      },
    };

    const output = await this.shopifyHelpers.graphqlFetch({ query, variables });
    if (output?.stagedUploadsCreate?.stagedTargets && output?.stagedUploadsCreate?.userErrors.length === 0) {
      return output.stagedUploadsCreate.stagedTargets[0];
    }
    throw new BaseError(500, 'Internal Server Error');
  }

  async stagedFileUpload(url: string, parameters: any[], filePath: string): Promise<any> {
    Logger.log(Logger.LogLevel.DEBUG, 'stagedFileUpload', { url, parameters, filePath });
    try {
      const bodyFormData = new FormData();
      parameters.forEach((parameter: any) => {
        bodyFormData.append(parameter.name, parameter.value);
      });
      bodyFormData.append('file', fs.createReadStream(filePath));
      return await this.shopifyHelpers.fetch(url, bodyFormData);
    } catch (error) {
      throw new BaseError(500, 'Error');
    }
  }

  async uploadFileToShopify(filePath: string) {
    Logger.log(Logger.LogLevel.DEBUG, 'uploadFileToShopify', filePath);
    // Generate a presigned URL to upload file
    const fileName = 'dummy';
    const { url, parameters } = await this.stagedUploadsCreate(fileName);
    const key = parameters.find((p: any) => p.name === 'key')?.value;
    const actionStatus = parameters.find((p: any) => p.name === 'success_action_status')?.value;

    if (url && parameters.length && key && fs.existsSync(filePath) && actionStatus.toString() === '201') {
      // Uploading file
      const fileUploadedOutput = await this.stagedFileUpload(url, parameters, filePath);
      // Remove file after uploading file
      fs.unlink(filePath, () => {
        Logger.log(Logger.LogLevel.DEBUG, 'Unlinked File: ', filePath);
      });
      return { key, fileUploadedOutput };
    }
    return;
  }

  async bulkOperationRunMutation(clientIdentifier: string, mutation: string, stagedUploadPath: string): Promise<any> {
    Logger.log(Logger.LogLevel.DEBUG, 'bulkOperationRunMutation', { clientIdentifier, mutation, stagedUploadPath });
    const query = `
      mutation bulkOperationRunMutation($mutation: String!, $stagedUploadPath: String!) {
        bulkOperationRunMutation(mutation: $mutation, stagedUploadPath: $stagedUploadPath) {
          bulkOperation {
            id
            url
            partialDataUrl
            status
            query
            type
            fileSize
            objectCount
            rootObjectCount
            createdAt
            completedAt
            errorCode
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const variables = { clientIdentifier: clientIdentifier, mutation: mutation, stagedUploadPath: stagedUploadPath };

    const output = await this.shopifyHelpers.graphqlFetch({ query, variables });
    if (output?.bulkOperationRunMutation?.bulkOperation && output?.bulkOperationRunMutation?.userErrors.length === 0) {
      return output?.bulkOperationRunMutation?.bulkOperation;
    }
    throw new BaseError(500, JSON.stringify(output));
  }

  async createBulkOperation(mutation: string, filePath: string) {
    Logger.log(Logger.LogLevel.DEBUG, 'createBulkOperation', { mutation, filePath });
    const uploaded = await this.uploadFileToShopify(filePath);
    if (uploaded?.key && uploaded?.fileUploadedOutput) {
      const clientIdentifier = `dummy_${Date.now()}`;
      const output = await this.bulkOperationRunMutation(clientIdentifier, mutation, uploaded?.key);
      return output;
    }
    return {};
  }
}
