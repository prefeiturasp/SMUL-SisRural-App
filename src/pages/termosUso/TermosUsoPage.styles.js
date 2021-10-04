import { StyleSheet } from 'react-native';

import Theme from '../../Theme';

export default StyleSheet.create({
    root: {
        flex: 1,
    },
    scrollview: {
        flexGrow: 1,
    },
    hr: {
        borderTopColor: Theme.colors.paleGrey,
        borderTopWidth: 1,
    },
});
