import { StyleSheet } from 'react-native';
import Theme from '../../Theme';

export default StyleSheet.create({
    root: {
        borderRadius: 4,
        paddingHorizontal: 25,
        paddingVertical: 20,
        backgroundColor: Theme.colors.teal,

        flexDirection: 'row',
        justifyContent: 'center',
    },
    content: {
        flex: 3,
    },
    contentRight: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    button: {
        margin: 10,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#FFF',
    },
});
