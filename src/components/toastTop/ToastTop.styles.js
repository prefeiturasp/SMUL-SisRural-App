import { Platform } from 'react-native';
import Theme from '../../Theme';

export default {
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,

        ...Platform.select({
            android: {
                elevation: 100,
            },
        }),
    },
    view: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 30,
        paddingVertical: 18,
    },
    viewInside: {
        paddingTop: 18,
    },
    text: {
        flex: 1,
        marginRight: 15,
    },
    warning: {
        backgroundColor: Theme.colors.coral,
    },
    info: {
        backgroundColor: Theme.colors.teal,
    },
};
