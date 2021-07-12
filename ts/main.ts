import { SensorDecodedValue } from './kiwrious/data/SensorDecodedValue';
import { SensorReadResult } from './kiwrious/data/SensorReadResult';
import { HeartRateResult, HEART_RATE_RESULT_STATUS } from './kiwrious/service/serial/HeartRateProcessor';
import serialService from './kiwrious/service/serial/SerialService';

const zincRenderer = (window as any).zincRenderer;
const speedSlider = <HTMLInputElement> document.getElementById("speed_slider");

const MAX_ZINC_VALUE = 6000;
const MAX_HEARTRATE_VALUE = 120;

const $connect = document.getElementById('btn-kiwrious-connect') as HTMLButtonElement;
const $disconnect = document.getElementById('btn-kiwrious-disconnect') as HTMLButtonElement;

serialService.onSerialConnection = (isConnected: boolean) => {
    $connect.style.display = isConnected? "none": "block";
    $disconnect.style.display = isConnected?"block": "none";
}

$connect.onclick = async () => {
    $connect.disabled = true;
    await serialService.connectAndReadAsync();
    $connect.disabled = false;
};

$disconnect.onclick = async () => {
    $disconnect.disabled = true;
    await serialService.disconnectAsync();
    $disconnect.disabled = false;
};

$disconnect.style.display = "none";


const $kiwriousValue = document.getElementById('kiwrious-value');

const convertToZincValue = (heartRateValue: number): number => {
    return MAX_ZINC_VALUE * heartRateValue / MAX_HEARTRATE_VALUE;
};

serialService.onSerialData = (decodedData: SensorReadResult) => {
    const values = decodedData.decodedValues as SensorDecodedValue[];
    
    const val = values[0].value;
    const status = val.status;
    const hrVal = val.heartrate;
    
    $kiwriousValue.innerText = status;

    if (status === 'Ready') {
        $kiwriousValue.innerText = hrVal.toString();

        const zincValue = convertToZincValue(hrVal);
        zincRenderer.setPlayRate(zincValue);

        speedSlider.value = String(zincValue);
    }
}
