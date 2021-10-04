import { StyleSheet } from 'react-native';
import Theme from '../../Theme';

const tintColor = Theme.colors.teal;
const textColor = 'rgba(0, 0, 0, .87)';
const baseColor = 'rgba(0, 0, 0, .38)';
const errorColor = 'rgb(213, 0, 0)';

export default StyleSheet.create({
    root: {
        paddingTop: 15,
    },
    labelText: {
        fontSize: 12,
        color: baseColor,
    },
    input: {
        fontSize: 16,
        color: textColor,
        padding: 0,
    },
    inputDisabled: {
        color: Theme.colors.disabled, //baseColor,
    },
    border: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: baseColor,
        marginVertical: 4,
    },
    borderFocused: {
        height: 2,
        backgroundColor: tintColor,
    },
    helper: {
        paddingVertical: 4,
    },
    helperText: {
        fontSize: 12,
        color: textColor,
    },
    colorError: {
        color: errorColor,
    },
    bgError: {
        backgroundColor: errorColor,
    },
    colorFocus: {
        color: tintColor,
    },
});
