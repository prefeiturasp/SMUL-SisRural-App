import React from 'react';

import PropTypes from 'prop-types';

import { View } from 'react-native';

import { Touchable, Text, Spacer } from '../';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import styles from './CardBlue.styles';

class CardBlue extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string,
        subtitle: PropTypes.string,
        onPress: PropTypes.func,
    };

    render() {
        const { subtitle, title, onPress } = this.props;

        return (
            <Touchable style={styles.root} onPress={onPress}>
                <View style={styles.content}>
                    <Text white fontBold size12>
                        {subtitle}
                    </Text>

                    <Spacer vertical={2} />

                    <Text white fontMedium size24>
                        {title}
                    </Text>

                    <Spacer vertical={3} />
                </View>

                <View style={styles.contentRight}>
                    <View style={styles.button}>
                        <MaterialIcons name="add" size={30} color={'#FFF'} />
                    </View>
                </View>
            </Touchable>
        );
    }
}

export default CardBlue;
