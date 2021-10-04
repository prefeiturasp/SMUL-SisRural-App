import React from 'react';

import PropTypes from 'prop-types';

import { connect } from '@cerebral/react';
import { field } from '@cerebral/forms';

import { state, props } from 'cerebral/tags';

export class ShowElement extends React.Component {
    static propTypes = {
        path: PropTypes.string.isRequired,
        field: PropTypes.any,

        matchValue: PropTypes.func,
    };

    static defaultProps = {
        matchValue: v => !!v,
    };

    render() {
        const { field } = this.props;

        const v = field && field.value ? field.value : '';

        if (this.props.matchValue(v)) {
            return this.props.children;
        }

        return null;
    }
}

export default connect(
    {
        field: field(state`${props`path`}`),
    },
    ShowElement
);
