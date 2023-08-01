export namespace TxtUtils {
  export const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  export const encodeBase64 = (str: any) => {
    return Buffer.from(str).toString('base64');
  };

  export const decodeBase64 = (str: any) => {
    return Buffer.from(decodeURIComponent(str), 'base64').toString('utf-8');
  };
}
