import React from 'react';

import { View, TouchableWithoutFeedback, TouchableOpacity, Platform } from 'react-native';

import PropTypes from 'prop-types';

export default class Touchable extends React.Component {
    static defaultProps = {
        activeOpacity: 1,
    };

    static propTypes = {
        activeOpacity: PropTypes.number,
        style: PropTypes.any,
        disabled: PropTypes.any,

        onPress: PropTypes.func,
    };

    render() {
        const isIOS = Platform.OS === 'ios';

        const { style, activeOpacity, ...props } = this.props;

        if (this.props.disabled) {
            return <View {...this.props}>{this.props.children}</View>;
        } else if (isIOS) {
            return (
                <TouchableOpacity activeOpacity={activeOpacity} {...this.props}>
                    {this.props.children}
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableWithoutFeedback {...props}>
                    <View style={style}>{this.props.children}</View>
                </TouchableWithoutFeedback>
            );
        }
    }
}
