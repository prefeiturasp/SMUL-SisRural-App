import { StyleSheet } from 'react-native';
import Theme from '../../Theme';

export default StyleSheet.create({
    root: {
        flexDirection: 'row',
        alignItems: 'center',

        borderWidth: 1,
        borderColor: Theme.colors.paleGrey,
        borderRadius: 4,
        backgroundColor: 'white',
    },
    textinput: {
        flex: 1,
        paddingVertical: 5,
    },
});
