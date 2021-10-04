import React from 'react';

import PropTypes from 'prop-types';

import { connect } from '@cerebral/react';
import { field } from '@cerebral/forms';
import { state, signal, props } from 'cerebral/tags';

class ComponentArrayConnect extends React.Component {
    static propTypes = {
        path: PropTypes.string.isRequired,

        value: PropTypes.any,
        field: PropTypes.any,

        signalToggleFieldArray: PropTypes.any,
        signalTouchedField: PropTypes.any,
        signalSetField: PropTypes.any,
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

    onChange = (child, value, ...args) => {
        const { path, signalToggleFieldArray } = this.props;

        signalToggleFieldArray({ path, value });

        // if (child.props.onToggle) {
        //     child.props.onToggle(evt, ...args);
        // }
    };

    render() {
        const {
            field: { touched, errorMessage, value, isValid },
        } = this.props;

        return React.Children.map(this.props.children, child => {
            return React.cloneElement(child, {
                // onChangeText: this.onChangeText.bind(this, child),
                onChange: this.onChange.bind(this, child),
                onBlur: this.onBlur.bind(this, child),
                value,
                error: touched && !isValid ? errorMessage : null,
                touched,
            });
        })[0];
    }
}

export default connect(
    {
        field: field(state`${props`path`}`),
        signalSetField: signal`form.setField`,
        signalTouchedField: signal`form.touchedField`,
        signalToggleFieldArray: signal`form.toggleFieldArray`,
    },
    ComponentArrayConnect
);
