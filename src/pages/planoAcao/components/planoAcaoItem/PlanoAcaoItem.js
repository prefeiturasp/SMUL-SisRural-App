import PropTypes from 'prop-types';
import React from 'react';
import { Avatar } from 'react-native-paper';
import { Spacer, Text, Touchable, ViewSmart } from '../../../../components';
import styles from './PlanoAcaoItem.styles';

class PlanoAcaoItem extends React.PureComponent {
    static propTypes = {
        nome: PropTypes.string,
        unidadeProdutiva: PropTypes.string,
        produtor: PropTypes.string,
        coprorietarios: PropTypes.string,
        mostrarInfoChecklist: PropTypes.bool,
        checklist: PropTypes.string,
        status: PropTypes.string,
        statusValue: PropTypes.string,
        dataCriacao: PropTypes.string,
        dataUpdate: PropTypes.string,
        dataValidade: PropTypes.string,
        onPress: PropTypes.func,
    };

    isRed = () => {
        const { statusValue } = this.props;

        if (!statusValue) {
            return false;
        }

        if (['rascunho', 'cancelado', 'atrasado', 'nao_iniciado'].indexOf(statusValue.toLowerCase()) > -1) {
            return true;
        }

        return false;
    };

    render() {
        const {
            nome,
            unidadeProdutiva,
            produtor,
            coprorietarios,
            mostrarInfoChecklist,
            checklist,
            status,
            dataCriacao,
            dataUpdate,
            dataValidade,
            onPress,
        } = this.props;

        const isRed = this.isRed();

        return (
            <Touchable style={styles.content} onPress={onPress} disabled={!onPress}>
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

                    {!!coprorietarios && (
                        <Text charcoal size14>
                            Coproprietários:{' '}
                            <Text teal size14>
                                {coprorietarios}
                            </Text>
                        </Text>
                    )}

                    {!!mostrarInfoChecklist && (
                        <Text charcoal size14>
                            Formulário:{' '}
                            <Text teal size14>
                                {!!checklist ? `Sim - ${checklist}` : 'Não'}
                            </Text>
                        </Text>
                    )}

                    {!!status && (
                        <ViewSmart row>
                            <Text charcoal size14>
                                Status:{' '}
                            </Text>
                            <Text coral={isRed} teal={!isRed} size14>
                                {status}
                            </Text>
                        </ViewSmart>
                    )}

                    {!!dataCriacao && (
                        <Text coolGreyLight size10>
                            {`Criado em: ${dataCriacao}`}
                        </Text>
                    )}

                    {!!dataUpdate && (
                        <Text coolGreyLight size10>
                            {`Atualizado em: ${dataUpdate}`}
                        </Text>
                    )}

                    {!!dataValidade && (
                        <Text coolGreyLight size10>
                            {`Válido até: ${dataValidade}`}
                        </Text>
                    )}
                </ViewSmart>
            </Touchable>
        );
    }
}

export default PlanoAcaoItem;
