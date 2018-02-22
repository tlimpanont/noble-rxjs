# noble rxjs stream based implementation
**working with Jack Berkhout**

```javascript
// development mode
npm run start:watch
``` 

### Options
check `options.js` to change discover and connection mode of BLE

### Characteristic
```javascript
const CHARACTERISTICS = {
 HEART_RATE_MEASUREMENT: '2a37',
 TEMPERATURE_MEASUREMENT: '2a1c',
 BATTERY_LEVEL: '2a19',
 SOUND_LEVEL: 'a101',
 CURRENT_VALUE: 'a401',
 BUTTON_STATE: 'a201',
 LED_STATE: 'a301',
 ...
};

```
Use `Characteristic.js` to do nobleCharacteristic.read((err, data)) implementation. Check `read(err, data)`
method

```
#written in javascript
```
