import React from 'react';

import PropTypes from 'prop-types';

import { View } from 'react-native';

import Theme from '../../../Theme';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { Spacer, Text, Touchable } from '../../../components';

import styles from './ItemCadernoCampo.styles';

class ItemCadernoCampo extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string,
        text: PropTypes.string,
        onPress: PropTypes.func,

        last: PropTypes.bool,
    };

    render() {
        const { title, text, last, onPress } = this.props;

        return (
            <View style={styles.root}>
                <Touchable style={styles.content} onPress={onPress}>
                    <View style={styles.icon}>
                        <MaterialIcons name="assignment" size={30} color={Theme.colors.greyBlue} />
                    </View>

                    <Spacer horizontal={2} />

                    <View>
                        <Text charcoal fontMedium size16>
                            {title}
                        </Text>

                        <Text coolGrey size12>
                            {text}
                        </Text>
                    </View>
                </Touchable>

                {!last && <View style={styles.hr} />}
            </View>
        );
    }
}

export default ItemCadernoCampo;
