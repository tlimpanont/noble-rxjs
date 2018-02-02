import {
  SERVICES
}
from "./Service";
import {
  CHARACTERISTICS
}
from "./Characteristic";

export const macbookPro2Options = {
  localName: 'Theuy’s MacBook Pro (2)',
  serviceUUIDs: ['180a', 'd0611e78bbb44591a5f8487910ae4366',
    '9fa480e0496745429390d343dc5d04ae'
  ],
  characteristicUUIDs: ['2a29', '2a24', '8667556c9a374c9184ed54ee27d90049',
    'af0badb15b9943cd917aa77bc549e3cc'
  ],
  reconnectionTimeout: 2000
};

export const theuyBVmbedBLEOptions = {
  localName: 'Theuy BV',
  serviceUUIDs: Object.values(SERVICES),
  characteristicUUIDs: Object.values(CHARACTERISTICS),
  reconnectionTimeout: 2000
};
