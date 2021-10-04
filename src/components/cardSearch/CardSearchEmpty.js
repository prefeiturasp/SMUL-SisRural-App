import React from 'react';
import { View } from 'react-native';
import styles from './CardSearch.styles';

class CardSearchEmpty extends React.PureComponent {
    render() {
        return <View style={[styles.root, styles.hidden]} />;
    }
}

export default CardSearchEmpty;
