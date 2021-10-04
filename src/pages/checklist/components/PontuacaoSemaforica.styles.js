import { StyleSheet } from 'react-native';
import Theme from '../../../Theme';

export default StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 15,
    },

    title: {
        flex: 1,
    },

    item: { flexDirection: 'row', alignItems: 'center' },

    itemLabel: {
        flex: 2,
        marginRight: 10,
    },

    itemColor: {
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: Theme.colors.paleGrey,
        padding: 10,
        flex: 3,
    },

    semaforicaGreen: { backgroundColor: Theme.colors.semaforicaGreen },
    semaforicaYellow: { backgroundColor: Theme.colors.semaforicaYellow },
    semaforicaRed: { backgroundColor: Theme.colors.semaforicaRed },
    semaforicaGrey: { backgroundColor: Theme.colors.semaforicaGrey },
    semaforicaNumerica: { backgroundColor: Theme.colors.semaforicaNumerica },
});
