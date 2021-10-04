import { StyleSheet } from 'react-native';
import Theme from '../../Theme';

export default StyleSheet.create({
    Tab: {
        backgroundColor: 'transparent',
        height: 55,
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.paleGrey,
    },
    TabIndicator: {
        backgroundColor: Theme.colors.teal,
        height: 3,
    },
    TabTab: {
        width: 160,
    },
    TabLabel__view: {
        width: 160, //Fix quebra de linha no modo bold
        alignItems: 'center',
        justifyContent: 'center',
    },
    TabLabel: {
        fontSize: 12,
        fontFamily: Theme.fontFamily.fontRegular,
        color: Theme.colors.greyBlue,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    TabLabel__focused: {
        fontFamily: Theme.fontFamily.fontBold,
        color: Theme.colors.teal,
    },
    TabLabel__disabled: {
        opacity: 0.1,
    },
});
