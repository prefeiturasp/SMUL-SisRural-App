import _ from 'lodash';
import React from 'react';
import isEqual from 'react-fast-compare';

function getName(obj) {
    return obj.constructor.name;
}

export class DebugRender extends React.Component {
    _tmpId = Math.round(Math.random() * 100);

    shouldComponentUpdate(nextProps, nextState) {
        const name = getName(this);
        console.log('RenderUtil prev', name, this.props, this.state);
        console.log('RenderUtil next', name, nextProps, nextState);

        _.forEach(nextProps, (value, key) => {
            const currentValue = this.props[key];
            if (currentValue != value) {
                console.log('RenderUtil prop change', name, `[${key}]`, currentValue, '=>', value);
            }
        });

        _.forEach(nextState, (value, key) => {
            const currentValue = this.state[key];
            if (currentValue != value) {
                console.log('RenderUtil state change', name, `[${key}]`, currentValue, '=>', value);
            }
        });

        const propsEqual = isEqual(this.props, nextProps);
        if (propsEqual) {
            console.log('RenderUtil skipping render', name);
        }
        return !propsEqual;
    }
}
