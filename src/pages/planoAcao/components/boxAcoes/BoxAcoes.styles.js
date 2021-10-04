import { StyleSheet } from 'react-native';
import Theme from '../../../../Theme';

export default StyleSheet.create({
    box: { backgroundColor: Theme.colors.white, elevation: 2, borderRadius: 4 },

    boxHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    adicionarButton: {
        paddingVertical: 0,
    },
    filtroAcoes: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        marginTop: -20, // collapsible content space
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: Theme.colors.paleGrey,
    },
    filtroAcoesMenu: {
        fontFamily: Theme.fontFamily.fontBold,
        fontSize: 14,
        color: Theme.colors.teal,
    },
});
