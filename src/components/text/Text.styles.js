import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    text: {
        backgroundColor: 'transparent' /* fix background IOS */,
    },
    underline: {
        textDecorationLine: 'underline',
    },
    textAlignCenter: {
        textAlign: 'center',
    },
});
