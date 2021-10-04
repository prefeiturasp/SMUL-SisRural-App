import { StyleSheet } from 'react-native';

import Theme from '../../Theme';

export default StyleSheet.create({
    hr: {
        height: 1,
        backgroundColor: Theme.colors.whiteTwo,
    },
    footer: {
        height: 38,
        justifyContent: 'center',
        alignItems: 'flex-end',

        paddingHorizontal: 20,
    },
});
