import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    root: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    },

    btnMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        padding: 12,
        justifyContent: 'center',
    },

    btnSync: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        padding: 12,
        justifyContent: 'center',
    },

    title: {
        flex: 1,
        marginHorizontal: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },

    logo: {
        width: 150,
        height: 40,
    },
});
