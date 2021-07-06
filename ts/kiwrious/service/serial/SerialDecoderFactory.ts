import { SerialDecoder } from "./SerialDecoder";
import { SENSOR_TYPE } from "./SerialRawValue";
import { SerialHeartRateDecoder } from "./SerialHeartRateDecoder";

export class SerialDecoderFactory {

    static _log(...msg: any) {
        console.log('|SerialDecoderFactory|', ...msg);
    }
    static _err(...msg: any) {
        console.error("|SerialDecoderFactory|", ...msg);
    }

    static createDecoder(type: string): SerialDecoder {
        SerialDecoderFactory._log('createDecoder');

        switch (type) {
            case SENSOR_TYPE.HEART_RATE: return new SerialHeartRateDecoder();
            
            default:
                throw new Error(`invalid type ${type}`);
        }
    }
}
