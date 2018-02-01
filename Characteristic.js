export const CHARACTERISTICS = {
  HEART_RATE_MEASUREMENT: '2a37',
  TEMPERATURE_MEASUREMENT: '2a1c',
  BATTERY_LEVEL: '2a19',
  SOUND_LEVEL: 'a101',
  BUTTON_STATE: 'a201',
  LED_STATE: 'a301',
};

export class Characteristic {
  constructor(peripheral, instance) {
    this.peripheral = peripheral;
    this.instance = instance;
    instance.read(this.read.bind(this));
  }

  /**
   * Method invoked when data is read from BLE
   * @param err
   * @param data - Example <Buffer 4d 61 63 42 6f 6f 6b 50 72 6f 31 31 2c 33>
   */
  read(err, data) {
    if (data) {
      switch (this.instance.uuid) {
        case CHARACTERISTICS.TEMPERATURE_MEASUREMENT:
          // implement
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
