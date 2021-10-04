import { StyleSheet } from 'react-native';

import Theme from '../../Theme';

export default StyleSheet.create({
    avatar: {
        backgroundColor: Theme.colors.paleGrey,
    },
    avatarLabel: {
        fontSize: 16,
    },

    content: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        paddingHorizontal: 20,
    },
});
