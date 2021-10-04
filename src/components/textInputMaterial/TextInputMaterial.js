import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { TextField } from '@softmedialab/react-native-material-textfield';
import Theme from '../../Theme';
import styles from './TextInputMaterial.styles';

class TextInputMaterial extends React.Component {
    static defaultProps = {};

    static propTypes = {
        /**MATERIAL */
        label: PropTypes.string,

        /** CEREBRAL */
        error: PropTypes.any,
        touched: PropTypes.bool,
        focus: PropTypes.bool,
        multiline: PropTypes.bool,
        customRef: PropTypes.object,

        /** REACT-NATIVE  */
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onChangeText: PropTypes.func,
        onSubmitEditing: PropTypes.func,

        keyboardType: PropTypes.oneOf(['default', 'number-pad', 'numeric', 'email-address', 'phone-pad']),
        secureTextEntry: PropTypes.bool,
        value: PropTypes.string,

        maxLength: PropTypes.number,

        mask: PropTypes.string,

        disabled: PropTypes.bool,
    };

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

    render() {
        const {
            label,
            mode,
            error,
            value,
            // touched,
            // focus,
            keyboardType,
            onSubmitEditing,
            secureTextEntry,
            multiline,
            maxLength,
            mask,
            disabled,
            customRef,
        } = this.props;

        const propsTextField = {
            ref: customRef,
            label: label,
            mode: mode,
            error,

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
            disabled,

            fontSize: Theme.sizes.size16,
            labelFontSize: Theme.sizes.size14,

            style: disabled ? { color: Theme.colors.disabled } : null,

            // baseColor: Theme.colors.teal
            tintColor: Theme.colors.teal,
        };

        const propsTextInputMask = {};

        return (
            <View style={styles.root}>
                {!!mask && (
                    <TextInputMask
                        {...propsTextField}
                        type={'custom'}
                        options={{ mask }}
                        customTextInput={TextField}
                        customTextInputProps={propsTextInputMask}
                    />
                )}

                {!mask && <TextField {...propsTextField} />}
            </View>
        );
    }
}

export default TextInputMaterial;
