import { StyleSheet } from 'react-native';
import Theme from '../../../../Theme';

export default StyleSheet.create({
    button: {
        borderColor: Theme.colors.darkGrey,
        borderWidth: StyleSheet.hairlineWidth,
        paddingTop: 15,
        paddingBottom: 15,
    },
    buttonAttachment: {
        elevation: 0,
    },
    image: {
        height: 200,
        width: null,
    },
});
