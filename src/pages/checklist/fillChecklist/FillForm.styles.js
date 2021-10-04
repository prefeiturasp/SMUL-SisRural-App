import { StyleSheet } from 'react-native';
import Theme from '../../../Theme';

export default StyleSheet.create({
    title: {
        fontSize: 16,
        color: Theme.colors.darkGrey,
        flex: 1,
    },
    titleCount: {
        flex: 0,
    },
    block: {
        elevation: 2,
        borderRadius: 4,
        backgroundColor: Theme.colors.white,
        marginTop: 10,
        marginBottom: 30,
    },

    question: {
        flex: 1,
        fontSize: Theme.sizes.size16,
        color: Theme.colors.darkGrey,
    },
    questionExtra: {
        fontSize: Theme.sizes.size12,
        color: Theme.colors.slateGrey,
    },
});
