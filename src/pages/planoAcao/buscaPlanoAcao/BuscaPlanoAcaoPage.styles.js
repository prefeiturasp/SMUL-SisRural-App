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
    },
    filtro: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: Theme.colors.paleGrey,
    },
    scrollview: {
        flexGrow: 1,
        backgroundColor: Theme.colors.paleGreyBg,
    },
    footer: {
        elevation: 2,
        backgroundColor: Theme.colors.paleGreyBg,
    },
});
