import { Dimensions, StyleSheet } from 'react-native';

export default StyleSheet.create({
    image: {
        width: Dimensions.get('window').width - 40,
        height: 400,
    },
});
