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
    scrollview: {
        flexGrow: 1,
        backgroundColor: Theme.colors.paleGreyBg,
    },
    footer: {
        elevation: 2,
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
});
