import { StyleSheet } from 'react-native';
import Theme from '../../../Theme';

export default StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    linha: { backgroundColor: Theme.colors.greyE0, height: 1, flex: 1 },
});
