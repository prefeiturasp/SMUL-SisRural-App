import React from 'react';

import PropTypes from 'prop-types';

import { ActivityIndicator } from 'react-native';

import { Spacer } from '../';

function Loading(props) {
    return (
        <Spacer horizontal={2} vertical={2}>
            <ActivityIndicator size={'large'} color={props.color} />
        </Spacer>
    );
}

Loading.propTypes = {
    color: PropTypes.string,
};

Loading.defaultProps = {
    color: 'black',
};

export default Loading;
