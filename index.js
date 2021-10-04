import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import debug from 'debug';
import { DEBUG } from 'react-native-dotenv';

debug.enable(DEBUG || '');

AppRegistry.registerComponent(appName, () => App);
