import { StyleSheet } from 'react-native';
import Theme from '../../../../Theme';
//import Theme from '../../../../Theme';

export default StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    cell: {
        width: 200,
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 10,
    },

    lineCell: {
        width: 120,
    },
    text: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Theme.colors.greyBlue,
    },
    input: {
        borderColor: '#AAA',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 10,
        padding: 5,
        paddingLeft: 10,
    },
});
