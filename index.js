import {Characteristic, CHARACTERISTICS} from "./Characteristic";
import {Service, SERVICES} from "./Service";

const Rx = require('rxjs/Rx');
const noble = require('noble');
const chalk = require('chalk');
import {Observable} from 'rxjs/Observable';

const cTable = require('console.table');


process.stdin.resume();
/** ================ PROCESS TERMINATION STREAMS ================ */
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
const appTermination$ = (peripheral) => {
  return Rx.Observable.merge(
    processUncaughtException$, processSIGINT$
  ).do(() => {
    console.log(chalk.red('terminate app and stop scanning!'));
    noble.stopScanning();
    peripheral.disconnect();
    process.exit();
  });
}
/** ================ END PROCESS TERMINATION STREAMS ================ */

/** ================ BLE CONNECTIVTY STREAMS ================ */
noble.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    console.log('POWERED ON, START SCANNING');
    noble.startScanning();
  } else if(state === 'poweredOff') {
    console.log('POWERED OFF, STOP SCANNING');
    noble.stopScanning();
  }
});
/** ================ END BLE CONNECTIVTY STREAMS ================ */

const connect$ = (peripheral) => {
  return new Rx.Observable((observer) => {
    peripheral.connect(function (err) {
      if (err) {
        observer.error(err)
      }
      observer.next(peripheral);
    });
  })
};
const discoverServices$ = (peripheral) => {
  return new Rx.Observable((observer) => {
    peripheral.discoverServices([], function (err, services) {
      if (err) {
        observer.error(err)
      }
      observer.next(services);
    });
  });
};
const discoverCharacteristics$ = (service) => {
  return new Rx.Observable((observer) => {
    service.discoverCharacteristics([], (err, characteristics) => {
      // console.log('characteristics typeof', typeof characteristics);
      // console.log('characteristics length', Object.keys(characteristics).length);
      observer.next(characteristics);
    });
  })
};
const discover$ = new Rx.Observable((observer) => {
  noble.on('discover', (peripheral) => {
    observer.next(peripheral);
  });
});


// const serviceUUIDs = Object.values(SERVICES);
const serviceUUIDs = ['180a', 'd0611e78bbb44591a5f8487910ae4366', '9fa480e0496745429390d343dc5d04ae'];
// const characteristicUUIDs = Object.values(CHARACTERISTICS);
const characteristicUUIDs = ['2a29', '2a24', '8667556c9a374c9184ed54ee27d90049', 'af0badb15b9943cd917aa77bc549e3cc'];

discover$
  .do((peripheral) => {
    console.log(chalk.green(peripheral.advertisement.localName));
    appTermination$(peripheral).subscribe();
  })
  .filter(peripheral => peripheral.advertisement.localName === 'Theuy’s MacBook Pro (2)')
  .do((peripheral) => {
    console.log(chalk.green('DISCOVERED: ' + peripheral.advertisement.localName + ', STOP SCANNING'));
    noble.stopScanning();
  })
  .mergeMap(connect$)
  .subscribe((peripheral) => {

    peripheral.once('disconnect', () => {
      console.log('*****************************disconnect, startScanning again************************************');
      noble.startScanning();
    });

    setTimeout(() => {
      peripheral.disconnect();
    }, 1000)

    discoverServices$(peripheral)
      .mergeMap(x => Observable.from(x))
      .do(x => console.log('serviceUuid', x.uuid))
      .filter(x => serviceUUIDs.includes(x.uuid))
      .subscribe((service) => {
        new Service(peripheral, service);
        discoverCharacteristics$(service)
          .mergeMap(x => Observable.from(x))
          .do(x => console.log('characteristicUuid', x.uuid))
          .filter(x => characteristicUUIDs.includes(x.uuid))
          .subscribe((characteristic) => new Characteristic(peripheral, characteristic));
      });
  });
