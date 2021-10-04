import { Platform, Dimensions } from 'react-native';

export default {
    isIOS: () => {
        return Platform.OS === 'ios';
    },
    heightStatusBar:
        Platform.OS === 'ios'
            ? isIphoneX()
                ? 44
                : 20
            : parseInt(Platform.Version, 10) <= 19
            ? 0 // Android <= 19 - não possui status bar translucente
            : 24,
    heightBottomBar: Platform.OS === 'ios' && isIphoneX() ? 34 : 0,
};

function isIphoneX() {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && (dimen.height === 812 || dimen.width === 812)
    );
}
