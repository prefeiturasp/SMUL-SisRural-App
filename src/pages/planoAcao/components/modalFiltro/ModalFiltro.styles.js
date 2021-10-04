import { StyleSheet, Dimensions } from 'react-native';
import Theme from '../../../../Theme';

export default StyleSheet.create({
    dialog: {
        maxHeight: Dimensions.get('window').height - 180,
    },
    dialogContent: { paddingLeft: 0, paddingRight: 0, paddingVertical: 20 },
    item: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    itemSelecionado: {
        backgroundColor: Theme.colors.paleGreyBg,
    },
});
