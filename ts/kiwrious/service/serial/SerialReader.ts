import {SerialRawValue} from "./SerialRawValue";
import { SerialUtil } from "./SerialUtil";

const EXPECTED_ARRAY_SIZE = 26;

export class SerialReader {
  private _array: Uint8Array;
  private readonly _reader: ReadableStreamDefaultReader;

  constructor(reader: ReadableStreamDefaultReader) {
    this._reader = reader;
    this._array = new Uint8Array();
  }

  _log(...msg: any) {
    console.log('|SerialReader|', ...msg);
  }

  _err(...msg: any) {
    console.error('|SerialReader|', ...msg);
  }

  private async _read(): Promise<SerialRawValue> {

    //If we have enough in the array use that don't read...
    if (this._array.length >= EXPECTED_ARRAY_SIZE) {
      const spliced = this._array.subarray(0, EXPECTED_ARRAY_SIZE);
      this._array = this._array.subarray(EXPECTED_ARRAY_SIZE);
      //this._log('reading from array..', this._array.length, spliced.length);

      return new SerialRawValue(spliced);
    }

    if (!this._reader) {
      this._err('readLoop - no reader. returning');
      throw new Error('no reader');
    }

    //read data from reader
    const readInstance = await this._reader.read();
    const {value, done} = readInstance;

    if (done) {
      //this._log("[readOnce] DONE", done);
      throw new Error('reader done');
    }

    //this._log('reading length', value.length);

    // if match expectation, clear buffer and return..
    if (value.length === EXPECTED_ARRAY_SIZE) {
      //this._log('array length matched. clearing temp array..');
      this._array = new Uint8Array();
      return new SerialRawValue(value.subarray(0));
    }

    //otherwise, append to array
    this._array = SerialUtil.concatArray(this._array, value);
    //this._log('added to array. length:', this._array.length);

    //then read again (recursive)
    return await this.readOnce();
  }


  async readMultiple(numberToRead: number = 10): Promise<SerialRawValue[]> {
    const array: SerialRawValue[]  = [];
    while (array.length < numberToRead) {
      // this._log('reading..')
      const value = await this._read();
      array.push(value);
    }

    return array;
  }


  async readOnce(): Promise<SerialRawValue> {
    const value = await this._read();

    // if (value) {
    //   this._log('reading meta', value.header2Bytes, value.footer2Bytes, value.rawValue.length, value.sensorTypeRaw);
    // }
    return value;
  }

}
