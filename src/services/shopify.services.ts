import S3 from 'aws-sdk/clients/s3';
import * as fastcsv from 'fast-csv';
import FormData from 'form-data';
import * as fs from 'fs';
import { BaseError } from '../../common/helpers/error.helpers';
import { AppServices } from './app.services';
import { ShopifyHelpers } from '../../common/helpers/shopify.helpers';

export class ShopifyServices extends AppServices {
  s3: S3;
  shopifyHelpers: ShopifyHelpers;
  constructor() {
    super();
    this.s3 = new S3({ region: 'ap-southeast-1' });
    this.shopifyHelpers = new ShopifyHelpers();
  }

  async stagedUploadsCreate(fileName: string): Promise<any> {
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
    const output = await this.shopifyHelpers.graphqlWithRetry({ query, variables });
    if (output?.stagedUploadsCreate?.stagedTargets && output?.stagedUploadsCreate?.userErrors.length === 0) {
      return output.stagedUploadsCreate.stagedTargets[0];
    }
    throw new BaseError(500, 'Internal Server Error');
  }

  async bulkOperationRunMutation(
    clientIdentifier: string,
    mutation: string,
    stagedUploadPath: string
  ): Promise<any> {
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
    const output = await this.shopifyHelpers.graphqlWithRetry({ query, variables });
    if (output?.bulkOperationRunMutation?.bulkOperation && output?.bulkOperationRunMutation?.userErrors.length === 0) {
      return output?.bulkOperationRunMutation?.bulkOperation;
    }
    throw new BaseError(500, JSON.stringify(output));
  };

  async stagedFileUpload(url: string, parameters: any[], filePath: string): Promise<any> {
    try {
      const bodyFormData = new FormData();
      parameters.forEach((parameter: any) => {
        bodyFormData.append(parameter.name, parameter.value);
      });
      bodyFormData.append('file', fs.createReadStream(filePath));
      return await this.shopifyHelpers.graphyqlWithURL(url, bodyFormData);
    } catch (error) {
      throw new BaseError(500, 'Error');
    }
  }

  async readFile(bucket: string, key: string) {
    const validData: any = [];
    const invalidData: any = [];
    const stream = this.s3
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .createReadStream();

    const file = stream.pipe(fastcsv.parse({ headers: true }));
    const request = new Promise((resolve, _) => {
      file
        .validate((row: any) => {
          return row.email;
        })
        .on('data-invalid', (row: any) => {
          invalidData.push(row);
        })
        .on('data', (row: any) => {
          validData.push(row);
        })
        .on('end', () => {
          resolve({ validData, invalidData });
        });
    });
    const data: any = await request;
    return data;
  }

  async uploadFileToShopify(filePath: string) {
    const fileName = 'dummy';
    console.log(new Date(), 'Create presigned URL');
    const { url, parameters } = await this.stagedUploadsCreate(fileName);
    const key = parameters.find((p: any) => p.name === 'key')?.value;
    const actionStatus = parameters.find((p: any) => p.name === 'success_action_status')?.value;
    console.log(new Date(), 'Presigned URL', url);
    if (url && parameters.length && key && fs.existsSync(filePath) && actionStatus.toString() === '201') {
      console.log(new Date(), 'Upload file');
      const fileUploadedOutput = await this.stagedFileUpload(url, parameters, filePath);
      fs.unlink(filePath, () => {
        console.log('Unlinked: ', filePath);
      });
      console.log(new Date(), 'Finish upload file');
      return { key, fileUploadedOutput };
    }
    return;
  }
}
