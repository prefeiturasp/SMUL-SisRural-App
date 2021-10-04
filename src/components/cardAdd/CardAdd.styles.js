import { StyleSheet } from 'react-native';
import Theme from '../../Theme';

export default StyleSheet.create({
    root: {
        borderRadius: 4,
        padding: 20,
        backgroundColor: Theme.colors.white,
        borderColor: Theme.colors.teal,
        borderWidth: 1,

        width: '40%',
        height: 145,

        margin: 5,

        elevation: 2,
    },
    rootDisabled: {
        opacity: 0.4,
    },
    icon: {
        borderWidth: 1,
        borderRadius: 4,
        borderColor: Theme.colors.teal,
        padding: 5,
    },
});
