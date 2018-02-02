import {addDocument} from "./mongodb";

export const CHARACTERISTICS = {
  HEART_RATE_MEASUREMENT: '2a37',
  TEMPERATURE_MEASUREMENT: '2a1c',
  BATTERY_LEVEL: '2a19',
  SOUND_LEVEL: 'a101',
  BUTTON_STATE: 'a201',
  LED_STATE: 'a301',
};

export class Characteristic {
  constructor(peripheral, nobleCharacteristic) {
    this.peripheral = peripheral;
    this.nobleCharacteristic = nobleCharacteristic;
    this.nobleCharacteristic.read(this.read.bind(this));
  }

  /**
   * Method invoked when data is read from BLE
   * @param err
   * @param data - Example <Buffer 4d 61 63 42 6f 6f 6b 50 72 6f 31 31 2c 33>
   */
  read(err, data) {
    if (data) {
      console.log('Characteristic value:', data.toString('hex'));
      switch (this.nobleCharacteristic.uuid) {
        case CHARACTERISTICS.TEMPERATURE_MEASUREMENT:
          var val = data.readUInt32LE(0) / 25600.0;
          console.log('TEMPERATURE_MEASUREMENT: ' + val + '\n');
          if (process.env.DB_NAME && process.env.CONNECTION_URL) {
            addDocument({temp: val})
              .then((result) => console.log(JSON.stringify(result, null, 4)))
          }
          break;
        case CHARACTERISTICS.LED_STATE:
          let currentLedValue = Number('0x' + data.toString('hex'));
          let writeLedValue = new Buffer(1);
          writeLedValue[0] = !currentLedValue;
          this.nobleCharacteristic.write(writeLedValue, false, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log('write successful');
            }
          });
          break;
        default:
          return
      }
      //from this.peripheral.advertisement.localName, this.peripheral.uuid
      //Please implement read data here!!!
      // write back this.instance.write(data, () => {});
    }
  }
}
