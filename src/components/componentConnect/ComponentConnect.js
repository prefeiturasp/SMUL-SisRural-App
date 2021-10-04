import { field } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { props, signal, state } from 'cerebral/tags';
import PropTypes from 'prop-types';
import React from 'react';




export class ComponentConnect extends React.Component {
    static propTypes = {
        path: PropTypes.string.isRequired,

        value: PropTypes.any,
        field: PropTypes.any,

        signalSetField: PropTypes.any,
        signalTouchedField: PropTypes.any,
        signalFocusField: PropTypes.any,
    };

    constructor(v) {
        super(v);
    }

    componentDidMount() {
        const { path, value, signalSetField } = this.props;

        if (value) {
            signalSetField({ path, value });
        }
    }

    onBlur = (child, evt) => {
        const { path, signalTouchedField } = this.props;
        signalTouchedField({ path });

        if (child.props.onBlur) {
            child.props.onBlur(evt);
        }
    };

    onFocus = (child, evt) => {
        const { path, signalFocusField } = this.props;
        signalFocusField({ path });

        if (child.props.onFocus) {
            child.props.onFocus(evt);
        }
    };

    onChangeText = (child, evt, ...args) => {
    const { path, signalSetField } = this.props;
        const value = evt && evt.nativeEvent ? evt.nativeEvent.text : evt;

        signalSetField({ path, value });

        if (child.props.onChangeText) {
            child.props.onChangeText(evt, ...args);
        }
    };

    render() {
        const {
            field: { touched, focus, errorMessage, value, isValid, customErrorMessage },
        } = this.props;

        return React.Children.map(this.props.children, child => {
            return React.cloneElement(child, {
                onChangeText: this.onChangeText.bind(this, child),
                onBlur: this.onBlur.bind(this, child),
                onFocus: this.onFocus.bind(this, child),
                value,
                error: touched && !isValid ? (customErrorMessage ? customErrorMessage : errorMessage) : null,
                touched,
                focus,
            });
        })[0];
    }
}

export default connect(
    {
        field: field(state`${props`path`}`),
        signalSetField: signal`form.setField`,
        signalTouchedField: signal`form.touchedField`,
        signalFocusField: signal`form.focusField`,
    },
    ComponentConnect
);
