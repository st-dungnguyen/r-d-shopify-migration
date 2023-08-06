import { S3Helpers } from "../../common/helpers/s3.helpers";
import { ShopifyHelpers } from "../../common/helpers/shopify.helpers";

export class AppServices {
  s3Helpers: S3Helpers;
  shopifyHelpers: ShopifyHelpers;

  constructor() {
    this.s3Helpers = new S3Helpers();
    this.shopifyHelpers = new ShopifyHelpers();
  }
}
