import { StyleSheet } from 'react-native';
import Theme from '../../../Theme';

export default StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        backgroundColor: Theme.colors.whiteTwo,
    },
    content: {
        backgroundColor: Theme.colors.paleGreyBg,
        paddingHorizontal: 20,
        flex: 1,
    },
    footer: {
        elevation: 2,
        backgroundColor: Theme.colors.paleGreyBg,
        paddingVertical: 20,
    },
    footerButtons: { flex: 1 },
    box: { backgroundColor: Theme.colors.white, elevation: 2, borderRadius: 4 },
    filtroAcoes: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: Theme.colors.paleGrey,
    },
    salvarObservacaoContent: {
        flexDirection: 'row',
    },
    excluirButton: {
        backgroundColor: Theme.colors.redLight,
        flex: 1,
    },
});
