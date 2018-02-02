import {TheuyBLEScanner} from "./TheuyBLEScanner";
import {theuyBVmbedBLEOptions} from "./options";

const bleScanner = new TheuyBLEScanner(theuyBVmbedBLEOptions);

bleScanner.startApplication();

