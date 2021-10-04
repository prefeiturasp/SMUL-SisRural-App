import { StyleSheet } from 'react-native';
import Theme from '../../Theme';

export default StyleSheet.create({
    Tab: {
        backgroundColor: 'transparent',
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.paleGrey,
    },
    TabIndicator: {
        height: 3,
        backgroundColor: Theme.colors.teal,
        width: 70,
    },
    TabWrapper: {
        flexDirection: 'row',
    },
    TextWrap: {},
    TabLabel: {
        fontSize: 12,
        textAlign: 'center',
        padding: 15,
        paddingLeft: 0,
        fontFamily: Theme.fontFamily.fontBold,
        color: Theme.colors.teal,
    },
});
