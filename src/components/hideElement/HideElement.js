import React from 'react';

import PropTypes from 'prop-types';

import { connect } from '@cerebral/react';
import { field } from '@cerebral/forms';

import { state, props } from 'cerebral/tags';

export class HideElement extends React.Component {
    static propTypes = {
        path: PropTypes.string.isRequired,
        field: PropTypes.any,
    };

    render() {
        const { field } = this.props;

        const value = field && field.value ? field.value : '';

        if (!value) {
            return this.props.children;
        }

        return null;
    }
}

export default connect(
    {
        field: field(state`${props`path`}`),
    },
    HideElement
);
