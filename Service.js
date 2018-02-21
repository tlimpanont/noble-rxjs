export const SERVICES = {
  HEALTH_THERMOMETER: '1809',
  HEART_RATE: '180d',
  BATTERY_SERVICE: '180f',
  SOUND_SERVICE: 'a100',
  CURRENT_SERVICE: 'a400',
  BUTTON_SERVICE: 'a200',
  LED_SERVICE: 'a300',
};
export class Service {
  constructor(peripheral, nobleService) {
    this.peripheral = peripheral;
    this.nobleService = nobleService;
  }
}
