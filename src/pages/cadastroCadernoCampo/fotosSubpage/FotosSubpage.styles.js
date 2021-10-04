import { StyleSheet } from 'react-native';
import Theme from '../../../Theme';

export default StyleSheet.create({
    list: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    item: {
        width: 100,
        height: 100,
        borderRadius: 6,
        margin: 5,
    },
    itemImage: {
        width: 100,
        height: 100,
        borderRadius: 6,
        resizeMode: 'cover',

        left: 0,
        top: 0,
    },
    fallback: {
        position: 'absolute',
        width: 40,
        height: 40,

        left: 50 - 20,
        top: 50 - 20,
    },
    addButton: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Theme.colors.teal,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
});
