import { StyleSheet } from 'react-native';
import Theme from '../../../../Theme';

export default StyleSheet.create({
    file: {
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Theme.colors.paleGreyTwo,
        marginBottom: 10,
        paddingBottom: 10,
    },
    image: {
        width: 140,
        height: 140,
    },

    fileTexts: {
        flex: 1,
        paddingLeft: 20,
    },
});
