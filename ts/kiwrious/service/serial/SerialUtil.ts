export class SerialUtil {
  static concatArray(a: Uint8Array, b: Uint8Array): Uint8Array {
    const c = new Uint8Array(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);

    return c;
  }

  
  static concatMultiArrays(arrays: Uint8Array[]): Uint8Array {
    const totalLen = arrays.reduce((a, c) =>{
        return a + c.length;
    }, 0);

    const result = new Uint8Array(totalLen);

    arrays.reduce((a, c) => {
        result.set(c, a);
        return a + c.length;
    }, 0);

    return result;
  }
}