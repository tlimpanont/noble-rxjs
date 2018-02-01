const Rx = require('rxjs/Rx');
const noble = require('noble');
const chalk = require('chalk');

process.stdin.resume();
// Catch exit
const processExit$ = new Rx.Observable(observer => {
  process.on('exit', code => {
    observer.next(code);
  });
}).do(() => console.log('onExit'));

const processSIGINT$ = new Rx.Observable(observer => {
  // Catch CTRL+C
  process.on('SIGINT', () => {
    observer.next();
  });
}).do(() => console.log('CTRL+C'));

const processUncaughtException$ = new Rx.Observable(observer => {
  // Catch uncaught exception
  process.on('uncaughtException', err => {
    if (err) {
      console.dir(err, {depth: null});
      observer.error(err);
    }
    observer.next();
  });
}).do(() => console.log('uncaughtException'));

const appTermination$ = Rx.Observable.merge(
  processExit$, processUncaughtException$, processSIGINT$
).do(() => {
  console.log(chalk.red('terminate app and stop scanning!'));
  noble.stopScanning();
  process.exit();
});

const nobleStateChage$ = new Rx.Observable((observer) => {
  noble.on('stateChange', (state) => {
    observer.next(state);
  });
});
exports.nobleStateChage$ = nobleStateChage$;
const poweredOn$ = nobleStateChage$.filter(state => state === 'poweredOn')
  .do(() => {
    console.log('POWERED ON, START SCANNING')
    noble.startScanning();
  });
exports.poweredOn$ = poweredOn$;
const poweredOff$ = nobleStateChage$.filter(state => state !== 'poweredOn')
  .do(() => {
    console.log('POWERED OFF, STOP SCANNING')
    noble.stopScanning();
  });
exports.poweredOff$ = poweredOff$;
const discover$ = new Rx.Observable((observer) => {
  noble.on('discover', (peripheral) => {
    observer.next(peripheral);
  });
});
exports.discover$ = discover$;
const disconnect$ = new Rx.Observable((observer) => {
  noble.on('disconnect', () => {
    observer.next();
  });
})
  .do(() => {
    console.log('DISCONNECT, STOP SCANNING!');
    noble.stopScanning();
  })
exports.disconnect$ = disconnect$;

const discoverWithLocalName$ = (stopScanningLocalName = '') => {
  return discover$.filter(peripheral => {
    const id = peripheral.id;
    const localName = String(peripheral.advertisement.localName);
    const serviceUuids = peripheral.advertisement.serviceUuids;
    const serviceData = peripheral.advertisement.serviceData;

    console.log('====================');
    console.log(chalk.yellow(`peripheral ${id} found with name: ${localName}`));
    console.log('====================');

    return (localName.indexOf(stopScanningLocalName) !== -1);
  })
    .do((peripheral) => {
      console.log(chalk.green('DISCOVERED: ' + stopScanningLocalName + ', STOP SCANNING'));
      // console.log('peripheral with ID ' + peripheral.id + ' found, Name: ' + peripheral.advertisement.localName);
      noble.stopScanning();
    });
};

appTermination$.subscribe();

const discoverPeripheralServices$ = (stopScanningLocalName = '', serviceUUIDs = []) => {
  return poweredOn$
    .merge(poweredOff$, disconnect$)
    .combineLatest(discoverWithLocalName$(stopScanningLocalName))
    .mergeMap(([state, peripheral]) => {
      const connect$ = new Rx.Observable((observer) => {
        peripheral.connect(function (err) {
          if (err) {
            observer.error(err)
          }
          observer.next();
        });
      })

      return connect$.mergeMap(() => {
        return new Rx.Observable((observer) => {
          peripheral.discoverServices(serviceUUIDs, function (err, services) {
            if (err) {
              observer.error(err)
            }
            observer.next(services);
          });
        })
      });
    });
}

const discoverPeripheralServices = function (stopScanningLocalName = 'Theuy B.V',
                                             serviceUUIDs = [],
                                             characteristicUUIDs = []) {

  const services$ = discoverPeripheralServices$(stopScanningLocalName, serviceUUIDs);

  const service$ = services$
    .mergeMap((services) => Rx.Observable.from(Array.from(services)));

  const getcharacteristicsByService$ = (service = {}) => {
    return new Rx.Observable((observer) => {
      service.discoverCharacteristics(characteristicUUIDs, (err, characteristics) => {
        // console.log('characteristics typeof', typeof characteristics);
        // console.log('characteristics length', Object.keys(characteristics).length);
        observer.next(characteristics);
      });
    })
  }
  const getDescriptosrByCharacteristic$ = (characteristic = {}) => {
    return new Rx.Observable((observer) => {
      characteristic.discoverDescriptors((err, descriptors) => {
        // console.log('descriptors typeof', typeof descriptors);
        // console.log('descriptors length', Object.keys(descriptors).length);
        observer.next(descriptors);
      });
    })
  }
  const characteristic$ = service$.mergeMap((service) => {
    return getcharacteristicsByService$(service);
  })
    .mergeMap(characteristics => Rx.Observable.from(Array.from(characteristics)))

  const descriptor$ = characteristic$.mergeMap((characteristic) => {
    return getDescriptosrByCharacteristic$(characteristic);
  })
    .mergeMap(descriptors => Rx.Observable.from(Array.from(descriptors)))

  return {
    characteristic$: characteristic$
  }
};

exports.discoverPeripheralServices = discoverPeripheralServices;


