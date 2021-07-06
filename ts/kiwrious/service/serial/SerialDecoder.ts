import { SensorReadResult } from "../../data/SensorReadResult";
import { SerialRawValue } from "./SerialRawValue";


export abstract class SerialDecoder {
    constructor() {
    }

    _log(...msg: any) {
        console.log('|SerialDecoder|', ...msg);
    }
    _err(...msg: any) {
        console.error("|SerialDecoder|", ...msg);
    }

    abstract decode(rawValue: SerialRawValue[]): Promise<SensorReadResult>|null;
}

