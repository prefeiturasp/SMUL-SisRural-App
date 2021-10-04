import { StyleSheet } from 'react-native';

import Theme from '../../Theme';

export default StyleSheet.create({
    root: {
        flex: 1,

        backgroundColor: Theme.colors.darkGreyBg,
    },
    scrollview: {
        flexGrow: 1,
    },
    textCenter: {
        textAlign: 'center',
    },
});
