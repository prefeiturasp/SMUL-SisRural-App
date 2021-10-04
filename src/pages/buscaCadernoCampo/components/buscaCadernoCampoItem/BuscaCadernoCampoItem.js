import PropTypes from 'prop-types';
import React from 'react';
import { Avatar } from 'react-native-paper';
import { Spacer, Text, Touchable, ViewSmart } from '../../../../components';
import styles from './BuscaCadernoCampoItem.styles';

class BuscaCadernoCampoItem extends React.PureComponent {
    static propTypes = {
        letters: PropTypes.string,

        nome: PropTypes.string,
        unidadeProdutiva: PropTypes.string,
        tecnico: PropTypes.string,
        status: PropTypes.string,
        ultimaVisita: PropTypes.string,

        onPress: PropTypes.func,
    };

    render() {
        const { letters, nome, unidadeProdutiva, tecnico, status, ultimaVisita, onPress } = this.props;

        const isRascunho = status && status.toLowerCase() === 'rascunho';

        return (
            <Touchable style={styles.content} onPress={onPress}>
                <Avatar.Text size={44} label={letters} style={styles.avatar} labelStyle={styles.avatarLabel} />

                <Spacer horizontal={1.5} />

                <ViewSmart flex1>
                    {!!nome && (
                        <Text charcoal fontBold size16>
                            {nome}
                        </Text>
                    )}

                    {!!unidadeProdutiva && (
                        <Text teal size14>
                            {unidadeProdutiva}
                        </Text>
                    )}

                    {!!tecnico && (
                        <Text charcoal size14>
                            Técnico:{' '}
                            <Text teal size14>
                                {tecnico}
                            </Text>
                        </Text>
                    )}

                    {!!status && (
                        <ViewSmart row>
                            <Text charcoal size14>
                                Status:{' '}
                            </Text>
                            <Text coral={isRascunho} teal={!isRascunho} size14>
                                {status}
                            </Text>
                        </ViewSmart>
                    )}

                    {!!ultimaVisita && (
                        <Text coolGreyLight size10>
                            {ultimaVisita}
                        </Text>
                    )}
                </ViewSmart>
            </Touchable>
        );
    }
}

export default BuscaCadernoCampoItem;
