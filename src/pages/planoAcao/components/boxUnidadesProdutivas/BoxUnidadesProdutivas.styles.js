import { StyleSheet } from 'react-native';
import Theme from '../../../../Theme';

export default StyleSheet.create({
    box: { backgroundColor: Theme.colors.white, elevation: 2, borderRadius: 4 },
    boxHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    adicionarButton: {
        paddingVertical: 0,
    },
});
