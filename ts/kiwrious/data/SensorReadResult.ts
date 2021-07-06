import { SensorDecodedValue } from "./SensorDecodedValue";


export interface SensorReadResult {
    sensorType: string;
    decodedValues: SensorDecodedValue[];
}
