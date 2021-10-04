import PropTypes from 'prop-types';
import React from 'react';
import { Avatar } from 'react-native-paper';
import { Spacer, Text, Touchable, ViewSmart } from '../../../../../components';
import styles from './BuscaChecklistItem.styles';

class BuscaChecklistItem extends React.PureComponent {
    static propTypes = {
        letters: PropTypes.string,
        nome: PropTypes.string,
        unidadeProdutiva: PropTypes.string,
        socios: PropTypes.string,
        produtor: PropTypes.string,
        status: PropTypes.string,
        criadoEm: PropTypes.string,
        atualizadoEm: PropTypes.string,
        finalizadoEm: PropTypes.string,
        finalizadoPor: PropTypes.string,
        onPress: PropTypes.func,
    };

    render() {
        const {
            letters,
            nome,
            unidadeProdutiva,
            socios,
            produtor,
            status,
            statusFlow,
            criadoEm,
            atualizadoEm,
            finalizadoEm,
            finalizadoPor,
            onPress,
        } = this.props;

        const isRascunho = status && status.toLowerCase() === 'rascunho';

        return (
            <Touchable style={styles.content} onPress={onPress}>
                <Avatar.Icon
                    icon="file-document-outline"
                    size={44}
                    style={styles.avatar}
                    labelStyle={styles.avatarLabel}
                />

                <Spacer horizontal={1.5} />

                <ViewSmart flex1>
                    {!!nome && (
                        <Text charcoal fontBold size16>
                            {nome}
                        </Text>
                    )}

                    {!!status && (
                        <ViewSmart row>
                            <Text charcoal size14>
                                Status:{' '}
                            </Text>
                            <Text coral={isRascunho} teal={!isRascunho} size14>
                                {statusFlow ? statusFlow : status}
                            </Text>
                        </ViewSmart>
                    )}

                    {!!unidadeProdutiva && (
                        <Text charcoal size14>
                            Unidade produtiva:{' '}
                            <Text teal size14>
                                {unidadeProdutiva}
                            </Text>
                        </Text>
                    )}

                    {!!produtor && (
                        <Text charcoal size14>
                            Produtor/a:{' '}
                            <Text teal size14>
                                {produtor}
                            </Text>
                        </Text>
                    )}

                    {!!socios && (
                        <Text charcoal size14>
                            Coproprietários:{' '}
                            <Text teal size14>
                                {socios}
                            </Text>
                        </Text>
                    )}

                    {!!criadoEm && (
                        <Text coolGreyLight size10>
                            Criado em: {criadoEm}
                        </Text>
                    )}

                    {!!atualizadoEm && (
                        <Text coolGreyLight size10>
                            Atualizado em: {atualizadoEm}
                        </Text>
                    )}

                    {!!finalizadoEm && (
                        <Text coolGreyLight size10>
                            Finalizado em: {finalizadoEm}
                        </Text>
                    )}

                    {!!finalizadoPor && (
                        <Text coolGreyLight size10>
                            Finalizado por: {finalizadoPor}
                        </Text>
                    )}
                </ViewSmart>
            </Touchable>
        );
    }
}

export default BuscaChecklistItem;
