import PropTypes from 'prop-types';
import React from 'react';
import { SmartIcon, Spacer, Text, Touchable, ViewSmart } from '../../../../components';
import { PLANO_ACAO_ITEM_PRIORIDADES, PLANO_ACAO_ITEM_STATUS } from '../../../../modules/PlanoAcaoItemModule';
import styles from './AcaoItem.styles';

class PlanoAcaoItem extends React.PureComponent {
    static propTypes = {
        descricao: PropTypes.string,
        prazo: PropTypes.string,
        status: PropTypes.string,
        prioridade: PropTypes.string,
        observacao: PropTypes.string,
        dataObservacao: PropTypes.string,
        onPress: PropTypes.func,
        hint: PropTypes.string,
    };

    onPress() {
        this.props.onPress();
    }

    render() {
        const { descricao, status, prazo, observacao, dataObservacao, prioridade, hint } = this.props;

        let prioridadeData = PLANO_ACAO_ITEM_PRIORIDADES.filter((p) => p.value == prioridade);
        prioridadeData = prioridadeData.length == 1 ? prioridadeData[0] : null;

        let statusData = PLANO_ACAO_ITEM_STATUS.filter((s) => s.value == status);
        statusData = statusData.length == 1 ? statusData[0] : null;

        return (
            <Touchable style={styles.content} onPress={this.onPress.bind(this)} disabled={!this.props.onPress}>
                <Spacer left={0} right={3}>
                    {prioridadeData && <SmartIcon icon={`iconimage@${prioridadeData.icon}`} size={24} />}
                </Spacer>

                <ViewSmart flex1>
                    {!!descricao && (
                        <>
                            <Text slateGrey fontBold size16>
                                {descricao}
                            </Text>
                            <Spacer vertical={0.4} />
                        </>
                    )}

                    {!!hint && (
                        <>
                            <Text slateGrey size12>
                                {hint}
                            </Text>
                            <Spacer vertical={0.4} />
                        </>
                    )}

                    {!!prazo && (
                        <>
                            <ViewSmart row>
                                <Text slateGrey size14>
                                    Prazo da Ação:{' '}
                                </Text>
                                <Text teal size14>
                                    {prazo}
                                </Text>
                            </ViewSmart>
                            <Spacer vertical={0.4} />
                        </>
                    )}

                    {!!statusData && (
                        <>
                            <ViewSmart row alignCenter>
                                <Text slateGrey size14>
                                    Status da Ação:
                                </Text>
                                <Spacer vertical={0} horizontal={0.5} />
                                <SmartIcon icon={`iconimage@${statusData.icon}`} size={14} />
                                <Spacer vertical={0} horizontal={0.5} />
                                <Text teal size14>
                                    {statusData.label}
                                </Text>
                            </ViewSmart>
                            <Spacer vertical={0.4} />
                        </>
                    )}

                    {!!observacao && !!dataObservacao && (
                        <>
                            <Text slateGrey size10>
                                {`Último acompanhamento: ${observacao}`}
                            </Text>
                            <Text slateGrey size10>
                                {dataObservacao}
                            </Text>
                        </>
                    )}
                </ViewSmart>
            </Touchable>
        );
    }
}

export default PlanoAcaoItem;
