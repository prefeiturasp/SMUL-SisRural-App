import { StyleSheet } from 'react-native';
import Theme from '../../Theme';

export default StyleSheet.create({
    root: {
        borderRadius: 4,

        backgroundColor: Theme.colors.white,

        elevation: 1,
    },

    rootNoBackground: {
        backgroundColor: 'transparent',
        elevation: 0,
    },

    flex1: {
        flex: 1,
    },
});
