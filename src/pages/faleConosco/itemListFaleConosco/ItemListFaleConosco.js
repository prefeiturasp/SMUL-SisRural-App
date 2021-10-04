import React from 'react';

import PropTypes from 'prop-types';

import { View } from 'react-native';

import { Text } from '../../../components';

import styles from './ItemListFaleConosco.styles';

class ItemListFaleConosco extends React.PureComponent {
    static propTypes = {
        text1: PropTypes.string,
        text2: PropTypes.string,
        text3: PropTypes.string,
    };

    render() {
        const { text1, text2, text3 } = this.props;

        return (
            <View style={styles.root}>
                <Text charcoal fontBold size16>
                    {text1}
                </Text>

                <Text teal size14>
                    {text2}
                </Text>

                <Text charcoal size14>
                    {text3}
                </Text>
            </View>
        );
    }
}

export default ItemListFaleConosco;
