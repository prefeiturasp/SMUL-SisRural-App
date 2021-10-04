import PropTypes from 'prop-types';
import React from 'react';
import { Text, TextInput, View } from 'react-native';
import styles from './TextAreaMaterial.styles';

class TextAreaMaterial extends React.Component {
    static defaultProps = {};

    static propTypes = {
        /**MATERIAL */
        label: PropTypes.string,

        /** CEREBRAL */
        error: PropTypes.any,
        touched: PropTypes.bool,
        focus: PropTypes.bool,
        multiline: PropTypes.bool,

        /** REACT-NATIVE  */
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onChangeText: PropTypes.func,
        onSubmitEditing: PropTypes.func,

        keyboardType: PropTypes.oneOf(['default', 'number-pad', 'numeric', 'email-address', 'phone-pad']),
        secureTextEntry: PropTypes.bool,
        value: PropTypes.string,

        maxLength: PropTypes.number,

        disabled: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.state = { focused: false };
    }

    onChangeText = text => {
        if (this.props.onChangeText) {
            this.props.onChangeText(text);
        }
    };

    onBlur = () => {
        this.setState({ focused: false });

        if (this.props.onBlur) {
            this.props.onBlur();
        }
    };

    onFocus = () => {
        this.setState({ focused: true });

        if (this.props.onFocus) {
            this.props.onFocus();
        }
    };

    render() {
        const { focused } = this.state;

        const {
            label,
            value,
            keyboardType,
            onSubmitEditing,
            secureTextEntry,
            multiline,
            maxLength,
            disabled,
        } = this.props;

        const isFocused = focused;

        const isValue = !!value;

        const isError = !!this.props.error;

        const propsTextField = {
            placeholder: focused || value ? '' : label,
            style: [styles.input, isError ? styles.colorError : null, disabled ? styles.inputDisabled : null],

            underlineColorAndroid: 'transparent',
            autoCapitalize: 'none',
            autoCorrect: false,

            value,
            keyboardType,

            secureTextEntry,
            multiline,
            onChangeText: this.onChangeText,
            onBlur: this.onBlur,
            onFocus: this.onFocus,

            onSubmitEditing,
            maxLength,

            editable: !disabled,
        };

        return (
            <View style={styles.root}>
                {(isFocused || isValue) && (
                    <View>
                        <Text
                            style={[
                                styles.labelText,
                                isFocused ? styles.colorFocus : null,
                                isError ? styles.colorError : null,
                            ]}
                        >
                            {this.props.label}
                        </Text>
                    </View>
                )}

                <TextInput {...propsTextField} />

                <View
                    style={[styles.border, isFocused ? styles.borderFocused : null, isError ? styles.bgError : null]}
                />

                {isError && (
                    <View style={styles.helper}>
                        <Text style={[styles.helperText, isError ? styles.colorError : null]}>{this.props.error}</Text>
                    </View>
                )}
            </View>
        );
    }
}

export default TextAreaMaterial;
