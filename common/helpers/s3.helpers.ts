import { S3 } from 'aws-sdk';
import * as fastcsv from 'fast-csv';

export class S3Helpers {
  s3: S3;
  constructor() {
    this.s3 = new S3({ region: 'ap-southeast-1' });
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
          return row;
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
}
