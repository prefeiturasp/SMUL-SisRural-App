import { StyleSheet } from 'react-native';
//import Theme from '../../../../Theme';

export default StyleSheet.create({
    root: {
        flexDirection: 'row',
        alignItems: 'center',

        padding: 15,
        borderRadius: 5,

        elevation: 2,

        flexShrink: 1,
    },

    text: {
        flexShrink: 1,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
});
