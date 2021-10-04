import color from 'color';
import PropTypes from 'prop-types';
import React from 'react';
import { Button as ButtonPaper } from 'react-native-paper';

class Button extends React.Component {
    static defaultProps = {
        disabled: false,
        loading: false,
        mode: 'contained',
        extraPadding: true,
    };

    static propTypes = {
        onDisabledPress: PropTypes.func,
        extraPadding: PropTypes.bool,
    };

    onPress = () => {
        const { loading, disabled, onDisabledPress } = this.props;

        if (!loading) {
            if (disabled && onDisabledPress) {
                this.props.onDisabledPress();
            } else if (!disabled) {
                this.props.onPress();
            }
        }
    };

    render() {
        const { disabled, extraPadding, ...rest } = this.props;

        const styleDisabled = disabled
            ? {
                  style: {
                      elevation: 0,

                      backgroundColor: color('#000')
                          .alpha(0.12)
                          .rgb()
                          .string(),
                  },
                  labelStyle: {
                      color: color('#FFF')
                          .alpha(0.8)
                          .rgb()
                          .string(),
                  },
              }
            : {};

        const styleExtraPadding = extraPadding ? { style: { paddingVertical: 5, ...rest.style } } : {};

        return (
            <ButtonPaper
                accessibilityState={{ busy: this.props.loading }}
                {...rest}
                onPress={this.onPress}
                {...styleDisabled}
                {...styleExtraPadding}
            />
        );
    }
}

export default Button;
