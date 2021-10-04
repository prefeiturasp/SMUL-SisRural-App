import React from 'react';

import PropTypes from 'prop-types';

import { Animated, Text as TextReactNative, StyleSheet } from 'react-native';

import { convertPropsToStyle } from '../../utils/ThemeUtil';

import { PropTypesColors, PropTypesFontFamily, PropTypesSizes } from '../../Theme';

import styles from './Text.styles';

class Text extends React.Component {
    static defaultProps = {
        fontRegular: true,
    };

    static propTypes = {
        style: PropTypes.any,

        animated: PropTypes.bool,

        fontLight: PropTypes.bool,
        fontRegular: PropTypes.bool,
        fontMedium: PropTypes.bool,
        fontSemiBold: PropTypes.bool,
        fontBold: PropTypes.bool,
        fontBlack: PropTypes.bool,

        alignCenter: PropTypes.bool,

        numberOfLines: PropTypes.number,

        ...PropTypesFontFamily,
        ...PropTypesColors,
        ...PropTypesSizes,
    };

    constructor(props) {
        super(props);
    }

    render() {
        const { animated, style, alignCenter, underline } = this.props;

        const styleText = [styles.text];

        convertPropsToStyle(this.props, 'colors', 'color', styleText);

        convertPropsToStyle(this.props, 'sizes', 'fontSize', styleText);

        convertPropsToStyle(this.props, 'fontFamily', 'fontFamily', styleText);

        convertPropsToStyle(this.props, 'lnh', 'lineHeight', styleText);

        if (alignCenter) {
            styleText.push(styles.textAlignCenter);
        }

        if (underline) {
            styleText.push(styles.underline);
        }

        if (style) {
            styleText.push(StyleSheet.flatten(style));
        }

        const Comp = animated ? Animated.Text : TextReactNative;
        return <Comp {...this.props} style={styleText} />;
    }
}

export default Text;
