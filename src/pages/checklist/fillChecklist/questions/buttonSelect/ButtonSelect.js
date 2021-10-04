import PropTypes from 'prop-types';
import React from 'react';
import { Spacer, Text, Touchable } from '../../../../../components';
import Theme from '../../../../../Theme';
import styles from './ButtonSelect.styles';

class ButtonSelect extends React.Component {
    static propTypes = {
        icon: PropTypes.any,
        onPress: PropTypes.any,

        checked: PropTypes.bool,
        loading: PropTypes.bool,
        disabled: PropTypes.bool,
    };

    onPress = () => {
        const { loading, disabled } = this.props;

        if (disabled || loading) {
            return;
        }

        this.props.onPress();
    };

    render() {
        const { icon, checked } = this.props;

        return (
            <Touchable
                style={[styles.root, { backgroundColor: checked ? Theme.colors.teal : Theme.colors.white }]}
                onPress={this.onPress}
            >
                {icon && icon}

                {icon && <Spacer horizontal={1.5} />}

                <Text fontMedium size14 black={!checked} white={checked} style={styles.text}>
                    {this.props.children}
                </Text>
            </Touchable>
        );
    }
}

export default ButtonSelect;
