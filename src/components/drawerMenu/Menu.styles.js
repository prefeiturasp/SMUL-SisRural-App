import { StyleSheet } from 'react-native';
import Theme from '../../Theme';

export default StyleSheet.create({
    root: {
        padding: 20,
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    avatar: {
        backgroundColor: Theme.colors.paleGrey,
    },
    avatarLabel: {
        fontSize: 24,
    },
    scrollviewContent: {
        flexGrow: 1,
    },
    ButtonMenu: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,

        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        overflow: 'hidden',
        marginVertical: 5,
    },
    ButtonMenu__rootSelected: {
        backgroundColor: '#F6F9FD',
    },
    ButtonMenu__selected: {
        backgroundColor: Theme.colors.teal,
        width: 3,

        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },
    Hr: {
        height: 1,
        backgroundColor: Theme.colors.paleGrey,
    },
});
