const fft = require('jsfft');

const MIN_INPUT_VALUE = 300000;
const MAX_INPUT_VALUE = 900000;
const SAMPLE_RATE = 200;

const INPUT_ARRAY_SIZE = 2048;
const RESULT_ARRAY_SIZE = 100;

const SOS = [
    [ [1.0000, 0, -1.0000], [1.0000, -1.9794, 0.9847]],
    [ [1.0000, 0, -1.0000], [1.0000, -1.9948, 0.9953]],
    [ [1.0000, 0, -1.0000], [1.0000, -1.9537, 0.9583]],
    [ [1.0000, 0, -1.0000], [1.0000, -1.9849, 0.9855]],
    [ [1.0000, 0, -1.0000], [1.0000, -1.9730, 0.9737]],
    [ [1.0000, 0, -1.0000], [1.0000, -1.9392, 0.9426]],
    [ [1.0000, 0, -1.0000], [1.0000, -1.9571, 0.9583]],
    [ [1.0000, 0, -1.0000], [1.0000, -1.9410, 0.9432]]
];

const GAIN =  [0.0256,     0.0256,     0.0254,     0.0254,     0.0252,     0.0252,     0.0251,     0.0251,     1.0000];

export const HEART_RATE_RESULT_STATUS = {
    TOO_LOW: 'TOO_LOW',
    TOO_HIGH: 'TOO_HIGH',
    PROCESSING: 'PROCESSING',
    READY: 'READY',
};

export interface HeartRateResult {
    status: string;
    value?: number;
}

class FixedArray {
    private _array: number[];
    private _size: number;
    private _sum: number;

    constructor(size: number) {
        this._size = size;
        this._array = [];
        this._sum = 0;
    }

    private _log(...msg: any) {
        console.log('|FixedArray|', ...msg);
    }

    get isAverageReady(): boolean {
        return this._array.length >= this._size;
    }

    get average(): number {
        return FixedArray.calcAverage(this._sum, this._array.length);
    }

    get array(): number[] {
        return this._array;
    }

    private _cleanup() {
        while(this._array.length > this._size) {
            const removed = this._array.shift();
            if (removed) {
                // this._log('removed..', removed);
                this._sum -= removed;
            }
        }
    }

    private _add(item: number) {
        //this._log('add..', item);
        this._array.push(item);
        this._sum += item;
    }

    add(item: number) {
        this._add(item);
        this._cleanup();
    }

    addItems(items: number[]) {
        for (const i of items) {
            this._add(i);
        }

        this._cleanup();
    }

    static calcSum(array: number[]) {
        return array.reduce((item, curr) => item + curr, 0);
    }

    static calcAverage(sum: number, length: number) {
        if (!length) {
            return 0;
        }

        return sum / length;
    }

    static createSteppedArray(startValue: number, stopValue: number, cardinality: number) {
        const arr = [];
        const step = (stopValue - startValue) / (cardinality - 1);
        for (let i = 0; i < cardinality; i++) {
            arr.push(startValue + (step * i));
        }

        return arr;
    }
}

// Biquad filter object
class Biquad {
    b: number[];
    a: number[];
    g1: number;
    g2: number;
    w: number[];

    // Biquad direct form II representation, g1 and g2 are input and output gains respectively
    constructor(b: number[], a: number[], g1: number, g2: number) {
        this.b = b;
        this.a = a;
        this.g1 = g1;
        this.g2 = g2;
        this.w = [1, 1, 1]
    }

    _log(...msg: any) {
        console.log('|Biquad|', ...msg);
    }

    updateFilter(x: number) {
        const xGained = x * this.g1;

        this.w[2] = this.w[1];
        this.w[1] = this.w[0];
        this.w[0] = xGained - this.a[1] * this.w[1] - this.a[2] * this.w[2];

        const y = this.b[0] * this.w[0] + this.b[1] * this.w[1] + this.b[2] * this.w[2];
        const yGained = y * this.g2;

        return yGained;
    }
}

export class HeartRateProcessor {
    private _filters: any;
    private _resultArray: FixedArray;
    private _inputArray: FixedArray;
    private _xf: number[];

    constructor() {
        this._log('ctor');

        this._initFilters();

        const halfSampleRate = Math.floor(SAMPLE_RATE/2);

        this._resultArray = new FixedArray(RESULT_ARRAY_SIZE);
        this._inputArray = new FixedArray(INPUT_ARRAY_SIZE);

        const L = INPUT_ARRAY_SIZE;
        const halfL = Math.floor(L / 2);
        this._xf = FixedArray.createSteppedArray(0, halfSampleRate, halfL);
    }

    private _log(...msg: any) {
        console.log('|HeartRateProcessor|', ...msg);
    }

    private _initFilters() {
        this._filters = SOS.map((s, i) => new Biquad(s[0], s[1], GAIN[i], 1));
    }

    getStatusForInput(input: number): string {
        if (input < MIN_INPUT_VALUE) {
            return HEART_RATE_RESULT_STATUS.TOO_LOW;
        }
        else if (input > MAX_INPUT_VALUE) {
            return HEART_RATE_RESULT_STATUS.TOO_HIGH;
        }

        return HEART_RATE_RESULT_STATUS.PROCESSING;
    }

    processSingleInput (input: number): HeartRateResult {
        const status = this.getStatusForInput(input);
        if (status !== HEART_RATE_RESULT_STATUS.PROCESSING) {
            // this._log('invalid value range');

            const result: HeartRateResult = {status};
            return result;
        }

        this._inputArray.add(input);
        const output = this.process();

        if (!output) {
            const result: HeartRateResult = {status: HEART_RATE_RESULT_STATUS.PROCESSING};
            return result;
        }

        const result: HeartRateResult = {status: HEART_RATE_RESULT_STATUS.READY, value: output};
        return result;
    }

    processMultiInput (inputArray: number[]): HeartRateResult {
        for (const input of inputArray) {
            const status = this.getStatusForInput(input);
            if (status !== HEART_RATE_RESULT_STATUS.PROCESSING) {
                // this._log('invalid value range');

                const result: HeartRateResult = {status};
                return result;
            }
        }

        this._inputArray.addItems(inputArray);
        const output = this.process();

        if (!output) {
            const result: HeartRateResult = {status: HEART_RATE_RESULT_STATUS.PROCESSING};
            return result;
        }

        const result: HeartRateResult = {status: HEART_RATE_RESULT_STATUS.READY, value: output};
        return result;
    }

    process(): number|null {
        if (!this._inputArray.isAverageReady) {
            //this._log('waiting for enough input', this._inputArray.array.length);
            return null;
        }

        const heartRate = this._process(this._inputArray);
        if (!heartRate) {
            return null;
        }

        this._resultArray.add(heartRate);
        if(!this._resultArray.isAverageReady) {
            //this._log('waiting for enough results', this._resultArray.array.length);
            return null;
        }

        return this._resultArray.average;
    }

    private _process(inputArray: FixedArray): number {
        if(!inputArray.isAverageReady) {
            throw new Error(`average is not ready. arr len: ${inputArray.array.length}`)
        }

        const filtered = inputArray.array.map((value: any) => {
            const adjustedV = value - inputArray.average;
            return this._updateAllFilters(adjustedV);
        });

        const dataFFT = new fft.ComplexArray(filtered.length).map((value: any, i: any, n: any) => {
            value.real = filtered[i];
        });
        const spectrum = dataFFT.FFT();
        const mag = spectrum.magnitude();

        let minVal = 0;
        let minIndex = 0;

        for (let index = 0; index < mag.length/2; index++) {
            const element = mag[index];

            if (element > minVal) {
                minVal = element;
                minIndex = index;
            }
        }

        const heartRate = this._xf[minIndex] * 60;
        return heartRate;
    }


    private _updateAllFilters(input: number) {
        let output;

        let current = input;
        for (let f of this._filters) {
            output = f.updateFilter(current);
            current = output;
        }

        return output;
    }

}
