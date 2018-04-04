import {addDocument} from "./mongodb";
const chalk = require('chalk');
const color_log_value = chalk.whiteBright.bgBlue.bold;

export const CHARACTERISTICS = {
  HEART_RATE_MEASUREMENT: '2a37',
  TEMPERATURE_MEASUREMENT: '2a1c',
  BATTERY_LEVEL: '2a19',
  VIBRATION_LEVEL: 'a101',
  CURRENT_VALUE: 'a401',
  VOLTAGE_VALUE: 'a501',
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
          console.log(color_log_value('TEMPERATURE_MEASUREMENT: ' + val));
          if (process.env.DB_NAME && process.env.CONNECTION_URL) {
            addDocument('temperatures', {temp: val})
              .then((result) => console.log(JSON.stringify(result, null, 4)))
          }
          break;
        case CHARACTERISTICS.VIBRATION_LEVEL:
          var val = data.readUInt32LE(0) / 25600.0;
          console.log(color_log_value('VIBRATION_LEVEL: ' + val));
          if (process.env.DB_NAME && process.env.CONNECTION_URL) {
            addDocument('vibrations', {vibration: val})
              .then((result) => console.log(JSON.stringify(result, null, 4)))
          }
          break;
        case CHARACTERISTICS.CURRENT_VALUE:
          var val = data.readUInt32LE(0) / 25600.0;
          console.log(color_log_value('CURRENT_VALUE: ' + val));
          if (process.env.DB_NAME && process.env.CONNECTION_URL) {
            addDocument('currents', {current: val})
              .then((result) => console.log(JSON.stringify(result, null, 4)))
          }
          break;
        case CHARACTERISTICS.VOLTAGE_VALUE:
          var val = data.readUInt32LE(0) / 25600.0;
          console.log(color_log_value('VOLTAGE_VALUE: ' + val));
          if (process.env.DB_NAME && process.env.CONNECTION_URL) {
            addDocument('voltages', {voltage: val})
              .then((result) => console.log(JSON.stringify(result, null, 4)))
          }
          break;
        case CHARACTERISTICS.BATTERY_LEVEL:
          var val = Number('0x' + data.toString('hex'));
          console.log(color_log_value('BATTERY_LEVEL: ' + val));
          if (process.env.DB_NAME && process.env.CONNECTION_URL) {
            addDocument('batteries', {battery: val})
              .then((result) => console.log(JSON.stringify(result, null, 4)))
          }
          break;
        case CHARACTERISTICS.BUTTON_STATE:
          var val = !!+Number('0x' + data.toString('hex'));
          console.log(color_log_value('BUTTON_STATE: ' + val));
          if (process.env.DB_NAME && process.env.CONNECTION_URL) {
            addDocument('buttons', {button: val})
              .then((result) => console.log(JSON.stringify(result, null, 4)))
          }
          break;
        case CHARACTERISTICS.LED_STATE:
          let currentLedValue = Number('0x' + data.toString('hex'));
          let writeLedValue = new Buffer(1);
          var val = !currentLedValue;
          console.log(color_log_value('LED_STATE: ' + val));
          if (process.env.DB_NAME && process.env.CONNECTION_URL) {
            addDocument('leds', {led: val})
              .then((result) => console.log(JSON.stringify(result, null, 4)))
          }
          writeLedValue[0] = val;
          this.nobleCharacteristic.write(writeLedValue, false, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log('write LED VALUE successful');
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
