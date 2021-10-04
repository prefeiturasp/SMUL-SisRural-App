import React from 'react';
import PropTypes from 'prop-types';

import { View } from 'react-native';

import { Touchable, Text, Spacer } from '../';

import { Checkbox } from 'react-native-paper';

import styles from './CheckboxMaterial.styles';

class CheckboxMaterial extends React.PureComponent {
    static defaultProps = {};

    static propTypes = {
        label: PropTypes.string,
        value: PropTypes.any,

        onChangeText: PropTypes.func,
    };

    onPress = () => {
        const { value } = this.props;

        if (this.props.onChangeText) {
            this.props.onChangeText(!value);
        }
    };

    render() {
        const { label, value } = this.props;

        return (
            <Touchable style={styles.root} onPress={this.onPress}>
                <View pointerEvents="none" style={styles.checkbox}>
                    <Checkbox status={value ? 'checked' : 'unchecked'} />
                </View>

                {!!label && <Spacer />}

                {!!label && <Text size16>{label}</Text>}
            </Touchable>
        );
    }
}

export default CheckboxMaterial;
