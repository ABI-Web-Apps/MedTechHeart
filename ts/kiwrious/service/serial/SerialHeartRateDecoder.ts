import { SensorDecodedValue } from "../../data/SensorDecodedValue";
import { SensorReadResult } from "../../data/SensorReadResult";
import { HeartRateProcessor, HeartRateResult } from "./HeartRateProcessor";
import { SerialDecoder } from "./SerialDecoder";
import { SENSOR_VALUE, SerialRawValue } from "./SerialRawValue";
import { SerialUtil } from "./SerialUtil";

export class SerialHeartRateDecoder extends SerialDecoder {
    _processor: HeartRateProcessor;
    _detector: HeartRateDetector;

    constructor() {
        super();

        this._processor = new HeartRateProcessor();
        
        // Detector 
        this._detector = new HeartRateDetector();
    }

    _log(...msg: any) {
        console.log('|SerialHeartRateDecoder|', ...msg);
    }

    async decode(array: SerialRawValue[]): Promise<SensorReadResult>|null {
        // this._log('headers-footers', rawValue.header2Bytes, rawValue.footer2Bytes);

        const subArrays = array.map(i=> i.rawValue.subarray(6,22));
        // this._log('subArrays', subArrays);

        const rawData = SerialUtil.concatMultiArrays(subArrays);
        // this._log('rawData', rawData);

        const heartRateResult = await this._detector.detectHeartRate(rawData);

        this._log('heartrate-result', heartRateResult);

        const value0: SensorDecodedValue = { label: SENSOR_VALUE.HEART_RATE, value: heartRateResult, type: "object" };

        const result: SensorReadResult = {
            sensorType: array[0].sensorType,
            decodedValues: [value0]
        };

        return result;
    }
}
