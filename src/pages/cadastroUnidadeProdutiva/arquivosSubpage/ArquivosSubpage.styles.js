import { StyleSheet } from 'react-native';
import Theme from '../../../Theme';

export default StyleSheet.create({
    file: {
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Theme.colors.paleGreyTwo,
        marginBottom: 10,
        paddingBottom: 10,
    },
    fileAttach: {
        width: 44,
        height: 44,
        backgroundColor: Theme.colors.paleGreyTwo,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileTexts: {
        flex: 1,
        paddingLeft: 20,
    },
});
