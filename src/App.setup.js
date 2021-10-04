// Polyfill cerebral-js
require('core-js/es6/reflect');
require('core-js/fn/object/set-prototype-of');

import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-br');

import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Accessing view manager configs directly']); //['You are passing an object to the component']
