import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import styles from './PontuacaoSimples.styles';
import { Spacer, Text } from '../../../components';

class PontuacaoSimples extends React.Component {
    static propTypes = {
        headerTitle: PropTypes.string,
        last: PropTypes.bool,
        total: PropTypes.string,
        boldTotal: PropTypes.bool,
    };

    static defaultProps = { last: true, boldTotal: false };

    constructor(props) {
        super(props);
    }

    render() {
        const { titulo, last, total, boldTotal } = this.props;
        return (
            <>
                <Spacer vertical={2} />
                <View style={styles.header}>
                    <Text size14>{titulo}</Text>
                    <Text size16 fontBold={boldTotal}>
                        {total}
                    </Text>
                </View>

                {!last && (
                    <>
                        <Spacer vertical={2} />
                        <View style={styles.linha} />
                    </>
                )}
            </>
        );
    }
}

export default PontuacaoSimples;
