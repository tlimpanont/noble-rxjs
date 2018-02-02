import {Characteristic} from "./Characteristic";
import {Service} from "./Service";
import {macbookPro2Options} from "./options";
import {Observable} from 'rxjs/Observable';

const os = require('os');
const Rx = require('rxjs/Rx');

// use noble package form package.json if os is of macosx
const noble = (os.platform().toLowerCase() === 'darwin') ? require('noble') : require('../index');
const chalk = require('chalk');
const cTable = require('console.table');
process.stdin.resume();
process.setMaxListeners(0);

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
    noble.stopScanning();
    peripheral.disconnect();
    console.log(chalk.red('stop scanning, disconnect and exit'));
    process.exit();
  });
}
/** ================ END PROCESS TERMINATION STREAMS ================ */

/** ================ BLE CONNECTIVITY STREAMS ================ */
noble.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    console.log('POWERED ON, START SCANNING');
    noble.startScanning();
  } else if (state === 'poweredOff') {
    console.log('POWERED OFF, STOP SCANNING');
    noble.stopScanning();
  }
});
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
const discover$ = new Rx.Observable((observer) => {
  noble.on('discover', (peripheral) => {
    observer.next(peripheral);
  });
});
/** ================ END BLE CONNECTIVITY STREAMS ================ */

/** ================ STREAM MAPPING FUNCTIONS NOBLE DATA ================ */
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

/** ================ END STREAM MAPPING FUNCTIONS NOBLE DATA ================ */


export class TheuyBLEScanner {
  constructor(options = macbookPro2Options) {
    this.options = options;
  }

  startApplication() {
    /** CONNECTION AND DISCOVER STREAM */
    discover$
      .do((peripheral) => {
        console.log(chalk.green(peripheral.advertisement.localName));
        appTermination$(peripheral).subscribe();
      })
      .filter(peripheral => peripheral.advertisement.localName === this.options.localName)
      .do((peripheral) => {
        console.log(chalk.green('DISCOVERED: ' + peripheral.advertisement.localName + ', STOP SCANNING'));
        noble.stopScanning();
      })
      .mergeMap(connect$)
      .subscribe((peripheral) => {

        /** GET DATA STREAM */
        discoverServices$(peripheral)
          .mergeMap(x => Observable.from(x))
          .do(x => console.log('serviceUuid', x.uuid))
          .filter(x => this.options.serviceUUIDs.includes(x.uuid))
          .subscribe((service) => {
            new Service(peripheral, service);
            discoverCharacteristics$(service)
              .mergeMap(x => Observable.from(x))
              .do(x => console.log('characteristicUuid', x.uuid))
              .filter(x => this.options.characteristicUUIDs.includes(x.uuid))
              .subscribe((characteristic) => new Characteristic(peripheral, characteristic));
          });
        /** END GET DATA STREAM */

        /** DISCONNECTION AND RE-CONNECTION **/
        peripheral.once('disconnect', () => {
          console.log('************************************disconnect, startScanning again************************************');
          noble.startScanning();
        });
        setTimeout(() => {
          peripheral.disconnect();
        }, this.options.reconnectionTimeout);
        /** END DISCONNECTION AND RE-CONNECTION **/
      });
    /** END CONNECTION AND DISCOVER STREAM */
  }
}

