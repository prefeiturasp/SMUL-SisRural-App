import { StyleSheet } from 'react-native';
import Theme from '../../../Theme';

export default StyleSheet.create({
    root: {},
    icon: {
        width: 64,
        height: 64,
        borderWidth: 1,
        borderColor: '#c7ced4',
        borderRadius: 4,

        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    hr: {
        height: 1,
        backgroundColor: Theme.colors.paleGrey,
    },
});
