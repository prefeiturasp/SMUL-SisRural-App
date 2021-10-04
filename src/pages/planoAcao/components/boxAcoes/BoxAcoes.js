import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import {
    Button,
    CollapsibleContent,
    QueryDb,
    Separator,
    SmartIcon,
    Spacer,
    Text,
    Touchable,
    ViewSmart,
} from '../../../../components';
import { PLANO_ACAO_ITEM_PRIORIDADES, PLANO_ACAO_ITEM_STATUS } from '../../../../modules/PlanoAcaoItemModule';
import Theme from '../../../../Theme';
import AcaoItem from '../acaoItem/AcaoItem';
import ModalFiltro from '../modalFiltro/ModalFiltro';
import styles from './BoxAcoes.styles';

const QUERY_ACOES = `
SELECT
    PAI.id as 'id',
	PAI.descricao as 'descricao',
	PAI.prazo as 'prazo',
    PAI.status as 'status',
    PAI.ultima_observacao as 'ultima_observacao',
	PAI.ultima_observacao_data as 'ultima_observacao_data',
	PAI.prioridade as 'prioridade',
    P.plano_acao_default as 'plano_acao_default'
FROM
    plano_acao_itens PAI
    LEFT JOIN checklist_perguntas CP on PAI.checklist_pergunta_id = CP.id 
    LEFT JOIN perguntas P on CP.pergunta_id = P.id
WHERE
        PAI.plano_acao_id = :plano_acao_id
    AND PAI.deleted_at is null
`;

const QUERY_ACOES_FILTRO_STATUS = `
    AND PAI.status = :status
`;

const QUERY_ACOES_FILTRO_PRIORIODADE = `
    AND PAI.prioridade = :prioridade
`;

const QUERY_ORDER_BY = `
    ORDER BY PAI.prioridade = 'priorizacao_tecnica' DESC, PAI.prioridade = 'acao_recomendada' DESC, PAI.prioridade = 'atendida' DESC 
`;

class BoxAcoes extends React.Component {
    static propTypes = {
        titulo: PropTypes.string,
        subtitulo: PropTypes.string,
        planoAcaoId: PropTypes.string,
        detalharAcoes: PropTypes.bool,
        permiteAdicionar: PropTypes.bool,
        onAdicionarAcaoPress: PropTypes.func,
        onEditarAcaoPress: PropTypes.func,
    };

    static defaultProps = {
        titulo: 'Ações',
    };

    constructor(props) {
        super(props);

        this.state = {
            filtroStatus: null,
            filtroPrioridade: null,
            filterOpen: false,
        };
    }

    onAdicionarAcaoPress() {
        const { onAdicionarAcaoPress } = this.props;
        onAdicionarAcaoPress();
    }

    onEditarAcaoPress(planoAcaoItemId) {
        const { onEditarAcaoPress } = this.props;
        onEditarAcaoPress(planoAcaoItemId);
    }

    onConfirmarFiltro({ status, prioridade }) {
        this.toggleFilterOpen();
        this.setState({ filtroStatus: status, filtroPrioridade: prioridade });
    }

    toggleFilterOpen() {
        this.setState({ filterOpen: !this.state.filterOpen });
    }

    render() {
        const { titulo, subtitulo, planoAcaoId, permiteAdicionar, detalharAcoes } = this.props;
        const { filtroStatus, filtroPrioridade, filterOpen } = this.state;

        let query = QUERY_ACOES;
        let parametros = [planoAcaoId];

        let filtroLabel = 'Todas';
        const filtrosDisponiveis = ['prioridade'];

        if (!detalharAcoes) {
            filtrosDisponiveis.push('status_pda_item');
            if (filtroStatus) {
                filtroLabel = PLANO_ACAO_ITEM_STATUS.filter((s) => s.value == filtroStatus)[0].label;
                query = `${query} ${QUERY_ACOES_FILTRO_STATUS}`;
                parametros.push(filtroStatus);
            }
        }

        if (filtroPrioridade) {
            filtroLabel =
                (filtroStatus ? filtroLabel + ', ' : '') +
                PLANO_ACAO_ITEM_PRIORIDADES.filter((p) => p.value == filtroPrioridade)[0].label;
            query = `${query} ${QUERY_ACOES_FILTRO_PRIORIODADE}`;
            parametros.push(filtroPrioridade);
        }

        query += QUERY_ORDER_BY;

        return (
            <Spacer horizontal={0} vertical={2} style={styles.box}>
                <CollapsibleContent
                    collapsed={false}
                    disableCollapse={permiteAdicionar}
                    header={
                        <ViewSmart flex1>
                            <View style={[styles.boxHeader]}>
                                <Text size18 fontBold slateGrey>
                                    {titulo}
                                </Text>
                                {permiteAdicionar && (
                                    <Button
                                        mode="contained"
                                        onPress={this.onAdicionarAcaoPress.bind(this)}
                                        style={styles.adicionarButton}
                                    >
                                        Adicionar
                                    </Button>
                                )}
                            </View>
                            {!!subtitulo && (
                                <Spacer top={4} horizontal={0}>
                                    <Text size14 slateGrey>
                                        {subtitulo}
                                    </Text>
                                </Spacer>
                            )}
                        </ViewSmart>
                    }
                >
                    <QueryDb query={query} params={parametros}>
                        {(data) => {
                            return (
                                <>
                                    {data.length == 0 && !filtroStatus && !filtroPrioridade ? (
                                        <ViewSmart alignCenter>
                                            <Spacer bottom={8} top={4}>
                                                <Text size18 slateGrey>
                                                    Ainda não há ações cadastradas
                                                </Text>
                                            </Spacer>
                                        </ViewSmart>
                                    ) : (
                                        <>
                                            <View>
                                                <Touchable
                                                    style={styles.filtroAcoes}
                                                    onPress={this.toggleFilterOpen.bind(this)}
                                                >
                                                    <Text size14 slateGrey>
                                                        Filtrar por:{'  '}
                                                    </Text>
                                                    <Text size14 teal fontBold>
                                                        {filtroLabel}
                                                    </Text>
                                                    <SmartIcon
                                                        icon="materialicons@arrow-drop-down"
                                                        size={24}
                                                        color={Theme.colors.teal}
                                                    />
                                                </Touchable>
                                                <ModalFiltro
                                                    tipos={filtrosDisponiveis}
                                                    visible={filterOpen}
                                                    onCancelar={this.toggleFilterOpen.bind(this)}
                                                    onConfirmar={this.onConfirmarFiltro.bind(this)}
                                                />
                                            </View>
                                        </>
                                    )}

                                    {data.map((planoAcaoItem, i) => (
                                        <React.Fragment key={i}>
                                            <AcaoItem
                                                descricao={planoAcaoItem.descricao}
                                                hint={
                                                    detalharAcoes &&
                                                    planoAcaoItem.descricao == planoAcaoItem.plano_acao_default &&
                                                    planoAcaoItem.prioridade != 'atendida'
                                                        ? 'Não houve detalhamento da ação'
                                                        : ''
                                                }
                                                status={!detalharAcoes ? planoAcaoItem.status : null}
                                                prazo={
                                                    planoAcaoItem.prazo
                                                        ? moment(planoAcaoItem.prazo).format('DD/MM/YYYY')
                                                        : null
                                                }
                                                observacao={planoAcaoItem.ultima_observacao}
                                                dataObservacao={
                                                    planoAcaoItem.ultima_observacao_data
                                                        ? moment(planoAcaoItem.ultima_observacao_data).format(
                                                              'DD/MM/YYYY'
                                                          )
                                                        : null
                                                }
                                                prioridade={planoAcaoItem.prioridade}
                                                onPress={this.onEditarAcaoPress.bind(this, planoAcaoItem.id)}
                                            />
                                            {i < data.length - 1 && <Separator />}
                                        </React.Fragment>
                                    ))}
                                </>
                            );
                        }}
                    </QueryDb>
                </CollapsibleContent>
            </Spacer>
        );
    }
}

export default BoxAcoes;
