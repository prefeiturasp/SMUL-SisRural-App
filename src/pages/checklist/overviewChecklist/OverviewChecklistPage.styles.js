import { StyleSheet } from 'react-native';
import Theme from '../../../Theme';

export default StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        backgroundColor: Theme.colors.whiteTwo,
    },
    scrollview: {
        backgroundColor: Theme.colors.paleGreyBg,
        paddingHorizontal: 20,
        flex: 1,
    },
    box: { backgroundColor: Theme.colors.white, elevation: 2, borderRadius: 4 },
    content: {
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: Theme.colors.paleGreyBg,
    },

    button: {
        elevation: 2,
        backgroundColor: Theme.colors.white,
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonSpacer: {
        flexDirection: 'row',
    },
    buttonName: {
        flex: 1,
    },
    excluirButton: {
        backgroundColor: Theme.colors.redLight,
    },
});
