import { StyleSheet } from 'react-native';
import Theme from '../../Theme';

export default StyleSheet.create({
    flex1:{
        flex:1
    },
    root: {
        flex: 1,
        backgroundColor: Theme.colors.whiteTwo,
    },
    scrollview: {
        flexGrow: 1,
    },
    avatar: {
        backgroundColor: '#7bc9b8',
    },
    avatarLabel: {
        fontSize: 20,
    },
});
