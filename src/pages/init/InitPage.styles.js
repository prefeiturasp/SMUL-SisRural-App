import { StyleSheet } from 'react-native';
import Theme from '../../Theme';

export default StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Theme.colors.darkGreyBg,

        alignItems: 'center',
        justifyContent: 'center',
    },

    loading: {
        marginTop: 20,
        opacity: 0.5,
    },

    logo: {
        width: 150,
        height: 40,
    },
});
