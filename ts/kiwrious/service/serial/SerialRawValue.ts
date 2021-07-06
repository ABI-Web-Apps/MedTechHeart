import { SerialHexValue } from "./SerialHexValue";

export const SENSOR_TYPE = {
    UNKNOWN: 'UNKNOWN',
    UV: 'UV',
    HUMIDITY: 'HUMIDITY',
    VOC: 'VOC',
    CONDUCTIVITY: 'CONDUCTIVITY',
    HEART_RATE: 'HEART_RATE',
    TEMPERATURE: 'TEMPERATURE',
    TEMPERATURE2: 'TEMPERATURE2',
    // TODO: other sensor types
};

export const SENSOR_VALUE = {
    UNKNOWN: 'UNKNOWN',
    UV_INDEX: 'Uv',
    LUX: 'Lux',
    HUMIDITY: 'Hum',
    TEMPERATURE: 'Temp',
    VOC: 'Voc',
    CONDUCTIVITY: 'Con',
    HEART_RATE: 'HeartRate',
    INFRARED_TEMPERATURE: 'InfraredTemp',
    AMBIENT_TEMPERATURE: 'AmbientTemp',
}

export class SerialRawValue {
    rawValue: Uint8Array;
    dataView: DataView;

    constructor(rawValue: Uint8Array) {
        this.rawValue = rawValue;
        this.dataView = new DataView(rawValue.buffer);

        if (!this.isValidLength) {
            throw new Error(`invalid array length. expected [] but got [${rawValue.length}]`);
        }
    }

    get isValidLength(): boolean {
        return this.rawValue.length === 26;
    }

    get sensorTypeRaw(): number {
        return this.rawValue[2];
    }

    get header2Bytes(): number {
        return this.getTwoBytesByIndex(0);
    }

    get sequence2Bytes(): number {
        return this.getTwoBytesByIndex(22);
    }

    get footer2Bytes(): number {
        return this.getTwoBytesByIndex(24);
    }

    get sensorType(): string {
        switch (this.sensorTypeRaw) {
            case 10: return SENSOR_TYPE.HEART_RATE;
            // TODO OTHER SENSORS

            default:
                throw new Error(`invalid sensor type ${this.sensorTypeRaw}`)
        }
    }

    // For humidity and temp sensor
    getTwoBytesSignedByIndex(index: number): number {
        const value = this.dataView.getInt16(index, true);

        return value;
    }

    getTwoBytesUnsignedByIndex(index: number): number {
      const value = this.dataView.getUint16(index, true);

      return value;
    }

    getTwoBytesByIndex(index: number): number {
        const value = this.dataView.getUint16(index, true);

        return value;
    }

    getFourBytesByIndex(index: number): number {
        const value = this.dataView.getUint32(index, true);
        return value;
    }

    getFourBytesFloatByIndex(index: number): number {
        const value = this.dataView.getFloat32(index, true);
        return value;
    }


    sliceBytes(index: number, numberOfBytes: number): Uint8Array {
        if (index+numberOfBytes > this.rawValue.length) {
            throw new Error(`invalid index [${index}] for array length [${this.rawValue.length}]`);
        }

        const sliced = this.rawValue.slice(index, index+numberOfBytes);

        return sliced;
    }


    getByteByIndex(index: number): number {
        if (index >= this.rawValue.length) {
            throw new Error(`invalid index [${index}] for array length [${this.rawValue.length}]`);
        }

        const value = this.rawValue[index];

        return value;
    }

    getHexDigitByIndex(index: number): string {
        if (index >= this.rawValue.length) {
            throw new Error(`invalid index [${index}] for array length [${this.rawValue.length}]`);
        }

        const value16 = this.rawValue[index]
            .toString(16)
            .padStart(2, '0');

        return value16;
    }

    // obsolete, use getTwoBytesByIndex() istead
    // TODO: refactor to use getTwoBytesByIndex()
    getHexString2(index0: number, index1: number): SerialHexValue {
        const data0_a = this.getHexDigitByIndex(index0);
        const data0_b = this.getHexDigitByIndex(index1);

        const data0 = `0x${data0_a}${data0_b}`;
        return new SerialHexValue(data0);
    }

    // obsolete, use getFourBytesByIndex() istead
    // TODO: refactor to use getFourBytesByIndex()
    getHexString4(index0: number, index1: number, index2: number, index3: number): SerialHexValue {
        const data0_a = this.getHexDigitByIndex(index0);
        const data0_b = this.getHexDigitByIndex(index1);
        const data0_c = this.getHexDigitByIndex(index2);
        const data0_d = this.getHexDigitByIndex(index3);

        const data0 = `0x${data0_a}${data0_b}${data0_c}${data0_d}`;
        return new SerialHexValue(data0);
    }
}

