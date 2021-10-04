import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    root: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 900,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    indicator: {},
    content: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 901,
    },
});
