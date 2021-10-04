import { DefaultTheme } from 'react-native-paper';
import Theme from './Theme';

//https://github.com/callstack/react-native-paper/blob/master/src/styles/DefaultTheme.tsx

export default {
    ...DefaultTheme,
    // dark: true,
    // mode: 'exact',
    colors: {
        ...DefaultTheme.colors,
        primary: Theme.colors.teal, //'#1665d8',
        background: '#FFF',
        error: '#FF0000',

        // placeholder: 'red',
        // backdrop: 'red',
        // notification: 'red',
        // onBackground: 'red',
        // onSurface: 'pink',
        // text: 'yellow',
        // accent: 'green',
        // surface: 'blue',
        // primary: 'black',
    },
};
