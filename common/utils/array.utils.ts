export namespace ArrayUtils {
  export const chunk = (items: any[], size: number) => {
    const chunks: any = [];
    items = [...items];

    while (items.length) {
      chunks.push(items.splice(0, size));
    }

    return chunks;
  };
}
