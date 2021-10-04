import React from 'react';
import { View } from 'react-native';

import PropTypes from 'prop-types';

import { Text } from '../';

import styles from './Empty.styles';

class Empty extends React.Component {
    static propTypes = {
        text: PropTypes.string,
    };

    render() {
        const { text } = this.props;

        return (
            <View style={styles.root}>
                <Text size24 darkGrey alignCenter>
                    {text}
                </Text>
            </View>
        );
    }
}

export default Empty;
