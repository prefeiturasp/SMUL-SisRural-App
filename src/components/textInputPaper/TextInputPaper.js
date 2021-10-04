import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { HelperText, TextInput } from 'react-native-paper';
import styles from './TextInputPaper.styles';

class TextInputPaper extends React.Component {
    static defaultProps = {
        mode: 'flat',
        numberOfLines: 1,
    };

    static propTypes = {
        /**PAPER */
        mode: PropTypes.oneOf(['outlined', 'flat']),
        label: PropTypes.string,
        accessibilityLabel: PropTypes.string,
        multiline: PropTypes.bool,
        numberOfLines: PropTypes.number,
        disabled: PropTypes.bool,
        /** CEREBRAL */
        error: PropTypes.any,
        touched: PropTypes.bool,
        focus: PropTypes.bool,

        /** REACT-NATIVE  */
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onChangeText: PropTypes.func,
        onSubmitEditing: PropTypes.func,

        keyboardType: PropTypes.oneOf(['default', 'number-pad', 'numeric', 'email-address', 'phone-pad']),
        secureTextEntry: PropTypes.bool,
        value: PropTypes.string,

        mask: PropTypes.string,

        editable: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.state = { password: props.secureTextEntry };
    }

    onChangeText = text => {
        if (this.props.onChangeText) {
            this.props.onChangeText(text);
        }
    };

    onBlur = () => {
        if (this.props.onBlur) {
            this.props.onBlur();
        }
    };

    onFocus = () => {
        if (this.props.onFocus) {
            this.props.onFocus();
        }
    };

    renderMask = props => {
        const { mask } = this.props;

        if (!mask) {
            return null;
        }

        return <TextInputMask {...props} type={'custom'} options={{ mask }} />;
    };

    render() {
        const {
            label,
            mode,
            multiline,
            numberOfLines,
            disabled,
            error,
            value,
            keyboardType,
            onSubmitEditing,
            secureTextEntry,
            accessibilityLabel,
            helperText,
            editable,
        } = this.props;

        let propsTextField = {
            label: label,
            mode: mode,
            multiline,
            numberOfLines,
            disabled,
            error,
            accessibilityLabel,
            underlineColorAndroid: 'transparent',
            autoCapitalize: 'none',
            autoCorrect: false,

            value,
            keyboardType,

            secureTextEntry,

            onChangeText: this.onChangeText,
            onBlur: this.onBlur,
            onFocus: this.onFocus,
            onSubmitEditing,

            editable,
        };

        if (this.props.mask) {
            propsTextField.render = this.renderMask;
        }

        return (
            <View style={styles.root}>
                <TextInput {...propsTextField} />
                {!!helperText && (
                    <HelperText type="info" style={styles.helper}>
                        {helperText}
                    </HelperText>
                )}
                <HelperText type="error" visible={!!error} style={styles.helper}>
                    {error}
                </HelperText>
            </View>
        );
    }
}

export default TextInputPaper;
