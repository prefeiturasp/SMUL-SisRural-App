import React from 'react';

import { StyleSheet, KeyboardAvoidingView } from 'react-native';

import { connect } from '@cerebral/react';
import { signal } from 'cerebral/tags';

import PropTypes from 'prop-types';

import { PlatformOS } from '../../utils';

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
});

class Form extends React.Component {
    static propTypes = {
        path: PropTypes.string,
        signalResetForm: PropTypes.any,

        onlyReset: PropTypes.bool,
    };

    constructor(props) {
        super(props);
    }

    componentWillUnmount() {
        const { path } = this.props;

        if (path) {
            this.props.signalResetForm({ path });
        }
    }

    render() {
        const { onlyReset } = this.props;

        if (onlyReset) {
            return null;
        }

        return (
            <KeyboardAvoidingView style={styles.root} enabled={PlatformOS.isIOS()} behavior={'padding'}>
                {this.props.children}
            </KeyboardAvoidingView>
        );
    }
}

export default connect(
    {
        signalResetForm: signal`form.resetForm`,
    },
    Form
);
