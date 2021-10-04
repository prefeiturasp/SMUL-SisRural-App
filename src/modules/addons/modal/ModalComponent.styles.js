import { StyleSheet } from 'react-native';

import Theme from '../../../Theme';

export default StyleSheet.create({
    root: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    content: {
        width: 280,
        backgroundColor: Theme.colors.whiteTwo,
        borderRadius: 5,
        borderTopColor: Theme.colors.whiteTwo,
    },
    title: {
        padding: 30,
        textAlign: 'center',
    },
    titleBorderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: 'red',
    },
    buttons: {
        flexDirection: 'row',
        borderTopWidth: 2,
        borderTopColor: 'green',
    },
    button: {
        flexGrow: 1,
        flex: 1,
        borderRightWidth: 2,
        borderRightColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    lastButton: {
        borderRightWidth: 0,
    },
    buttonText: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        textAlign: 'center',
    },
    buttonTextWithIcon: {
        paddingBottom: 10,
    },
    buttonIcon: {
        paddingTop: 10,
    },
});
