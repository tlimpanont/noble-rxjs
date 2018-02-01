const rxNoble = require('./index');
const ble = rxNoble.discoverPeripheralServices('Theuy BV', [], []);


// // ble.characteristic$.subscribe(x => console.log(x));
ble.characteristic$
  .filter(desc => desc.properties.indexOf('read') !== -1)
  .subscribe(x => console.log(x));


