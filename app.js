const ble = require('./index')
  .discoverPeripheralServices('Theuy’s MacBook Pro (2)', [], []);

// ble.characteristic$.subscribe(x => console.log(x));
ble.characteristic$
.filter( desc => desc.properties.indexOf('read') !== -1)
.subscribe(x => console.log(x));


