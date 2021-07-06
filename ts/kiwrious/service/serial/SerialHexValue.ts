
export class SerialHexValue {
    rawHexValue: string;

    constructor(rawHexValue: string) {
        this.rawHexValue = rawHexValue;
    }

    toFloat(): number {
        const raw = Number(this.rawHexValue);

        const s = raw & 0x80000000 ? -1 : 1;
        const e = ((raw >> 23) & 0xff) - 127;
        const c = 1 + (raw & 0x7fffff) / 0x7fffff;
        return s * c * Math.pow(2, e);
    }

    toInt(): number {
        return Number((parseInt(this.rawHexValue)).toFixed());
    }

    divideByHundred(): number {
        return Number((parseInt(this.rawHexValue) / 100).toFixed());
    }
}

export class SerialNumberValue {
  private readonly _raw: number;

  constructor(value: number) {
    this._raw = value;
  }

  get value() {
    return this._raw;
  }

  toInt(): number {
    return Number(this._raw.toFixed());
  }

  divideByHundred(): number {
    return Number((this._raw / 100).toFixed());
  }
}
