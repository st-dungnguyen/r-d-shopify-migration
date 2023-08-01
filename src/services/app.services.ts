import Ajv from 'ajv';

export class AppServices {
  ajv: Ajv;
  constructor() {
    this.ajv = new Ajv();
  }
}
