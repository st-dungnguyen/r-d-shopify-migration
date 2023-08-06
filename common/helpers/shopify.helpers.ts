import axios, { AxiosInstance } from 'axios';
import { appConfig } from '../../config';
import { BaseError } from './error.helpers';

export class ShopifyHelpers {
  client: AxiosInstance;

  constructor() {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Shopify-Access-Token': appConfig.shopify.accessToken
    };

    this.client = axios.create({
      baseURL: `https://${appConfig.shopify.storeName}.myshopify.com/admin/api`,
      headers: defaultHeaders,
    })
  }

  async graphqlFetch(input: { query: string; variables?: any }, retry: number = 0): Promise<any> {
    try {
      const response = await this.client.post('/2023-07/graphql.json', input);
      const { data, extensions, errors } = response.data;
      if (errors || errors?.length) {
        const isNotEnoughResource =
          extensions?.cost?.throttleStatus?.currentlyAvailable < extensions?.cost?.throttleStatus?.requestedQueryCost;
        if (isNotEnoughResource) {
          console.warn('Shopify not enough resource to process request : ', extensions);
        }
        throw new BaseError(500, 'Internal Error');
      }
      return data;
    } catch (error: unknown) {
      if (retry < 5) {
        retry += 1;
        console.info(`[GRAPHQL] Shopify GraphQL retry ${retry} times`);
        return await this.graphqlFetch(input, retry);
      }
      console.error('[GRAPHQL] Shopify GraphQL Errors : ', JSON.stringify(error));
      throw new BaseError(500, 'Internal Error');
    }
  }

  async fetch(url: string, input: any) {
    const output = await this.client.post(url, input, {
      headers: {
        ...input.getHeaders(),
      },
    });
    return output.data;
  }
}
