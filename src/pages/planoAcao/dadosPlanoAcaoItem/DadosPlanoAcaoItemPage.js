import { field, form } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
    ActionRoute,
    Button,
    CollapsibleContent,
    ComponentConnect,
    DropdownPaper,
    HeaderMenu,
    Loading,
    QueryDb,
    Spacer,
    Text,
    TextInputPaper,
    ViewSmart,
} from '../../../components';
import { PLANO_ACAO_ITEM_PRIORIDADES, PLANO_ACAO_ITEM_STATUS } from '../../../modules/PlanoAcaoItemModule';
import { makePromise } from '../../../utils/CerebralUtil';
import BoxObservacoes from '../components/boxObservacoes/BoxObservacoes';
import PlanoAcaoItem from '../components/planoAcaoItem/PlanoAcaoItem';
import styles from './DadosPlanoAcaoItemPage.styles';

const QUERY_PLANO_ACAO = `
SELECT
    PA.nome as 'planoAcaoNome',
    PA.status as 'planoAcaoStatus',
    PA.fl_coletivo as 'flColetivo',
    PA.checklist_unidade_produtiva_id as 'checklistUnidadeProdutivaId',
	UP.nome as 'unidadeProdutivaNome',
    UP.socios as 'unidadeProdutivaSocios',
    P.nome as 'produtorNome'
FROM	
    plano_acoes PA
LEFT JOIN 
    produtores P ON P.id = PA.produtor_id
LEFT JOIN
    unidade_produtivas UP ON UP.id = PA.unidade_produtiva_id
WHERE
        PA.id = :id
    AND PA.deleted_at is null
`;

// AND UP.deleted_at is null
// AND P.deleted_at is null

const QUERY_OBSERVACOES = `
SELECT
    paih.texto,
    paih.created_at
FROM
	plano_acao_item_historicos paih
WHERE
    paih.plano_acao_item_id = :plano_acao_item_id
	AND paih.deleted_at is null
`;

const QUERY_PERGUNTA_CHECKLIST = `
SELECT p.pergunta AS pergunta,
       p.plano_acao_default as plano_acao_default,
       csr.resposta AS respostaTexto,
       r.descricao AS resposta
  FROM checklist_perguntas cp
 INNER JOIN plano_acoes pa ON pa.id = :planoAcaoId
  LEFT JOIN checklist_snapshot_respostas csr ON csr.pergunta_id = cp.pergunta_id AND csr.id = :checklistSnapshotRespostaId
  LEFT JOIN unidade_produtiva_respostas upr ON upr.unidade_produtiva_id = pa.unidade_produtiva_id AND upr.pergunta_id = cp.pergunta_id
  LEFT JOIN respostas r ON r.id = IFNULL(csr.resposta_id, upr.resposta_id)
 INNER JOIN perguntas p ON p.id = cp.pergunta_id
 WHERE cp.id = :checklistPerguntaId
`;

class DadosPlanoAcaoPage extends React.Component {
    static propTypes = {};

    state = {
        query: '',
        filter: 'todos',
    };

    constructor(props) {
        super(props);
        this.state = { loading: false };
    }

    componentDidMount() {
        const { planoAcaoId, planoAcaoItemId } = this.props.match.params;
        if (planoAcaoId && !planoAcaoItemId) {
            this.props.signalIniciarCadastroPlanoAcaoItem({ planoAcaoId });
        } else {
            this.props.signalFetchPlanoAcaoItem({ planoAcaoItemId, onComplete: this.startLoadingPromise() });
        }
    }

    startLoadingPromise() {
        const { promise, id } = makePromise();

        this.setState({ loading: true });
        promise.then((data) => {
            this.setState({ loading: false });
        });

        return id;
    }

    componentWillUnmount() {
        this.props.signalResetPlanoAcaoItem();
    }

    onSalvarObservacaoPress() {
        const { formObservacao, signalTouchedField, signalSalvarObservacao } = this.props;

        const path = 'planoAcaoItem.formObservacao.texto';
        signalTouchedField({ path }); // força o touch para marcar o campo caso não esteja preenchido

        if (!formObservacao.isValid) {
            return;
        }

        signalSalvarObservacao();
    }

    onSalvarPress() {
        const { signalSalvarPlanoAcaoItem } = this.props;
        signalSalvarPlanoAcaoItem({ onComplete: this.startLoadingPromise() });
    }

    onSalvarDisabledPress() {
        this.props.signalTouchForm({ form: 'planoAcaoItem.formPlanoAcaoItem' });
    }

    onCancelarPress() {
        ActionRoute.back();
    }

    onExcluirPress() {
        const { signalExcluirPlanoAcaoItem } = this.props;
        signalExcluirPlanoAcaoItem({ onComplete: this.startLoadingPromise() });
    }

    onReabrirPress() {
        const { signalReabrirPlanoAcaoItem } = this.props;
        signalReabrirPlanoAcaoItem({ onComplete: this.startLoadingPromise() });
    }

    verificaPlanoColetivoUnidadeProdutiva() {
        const { formPlanoAcaoItem } = this.props;
        const {
            fl_coletivo: fieldColetivo,
            plano_acao_item_coletivo_id: fieldPlanoAcaoItemColetivoId,
        } = formPlanoAcaoItem;
        return fieldColetivo.value == 1 && !!fieldPlanoAcaoItemColetivoId.value;
    }

    renderDadosChecklist(statusPlanoAcao) {
        const { formPlanoAcaoItem } = this.props;

        return (
            <QueryDb
                query={QUERY_PERGUNTA_CHECKLIST}
                params={[
                    formPlanoAcaoItem.plano_acao_id.value,
                    formPlanoAcaoItem.checklist_snapshot_resposta_id.value,
                    formPlanoAcaoItem.checklist_pergunta_id.value,
                ]}
                returnFirst
            >
                {(data) => {
                    return !data ? null : (
                        <Spacer horizontal={0} vertical={2} style={styles.box}>
                            <CollapsibleContent
                                collapsed={statusPlanoAcao != 'rascunho'}
                                header={
                                    <Text size18 fontBold slateGrey>
                                        Dados Complementares
                                    </Text>
                                }
                            >
                                <Spacer horizontal={4}>
                                    <TextInputPaper
                                        mode="outlined"
                                        label="Pergunta"
                                        value={data.pergunta}
                                        disabled
                                        multiline
                                    />
                                    <TextInputPaper
                                        mode="outlined"
                                        label="Resposta"
                                        multiline={!data.resposta}
                                        numberOfLines={data.resposta || !data.respostaTexto ? 1 : 6}
                                        value={data.resposta ? data.resposta : data.respostaTexto}
                                        disabled
                                        multiline
                                    />

                                    <TextInputPaper
                                        mode="outlined"
                                        label="Ação recomendada"
                                        value={data.plano_acao_default}
                                        disabled
                                        multiline
                                    />
                                </Spacer>
                            </CollapsibleContent>
                        </Spacer>
                    );
                }}
            </QueryDb>
        );
    }

    renderSobre() {
        const {
            permissoesFormPlanoAcaoItem: { permiteAlterar, permiteAlterarDescricao, somenteDetalhar },
        } = this.props;
        return (
            <Spacer horizontal={0} vertical={2} style={styles.box}>
                <CollapsibleContent
                    collapsed={false}
                    header={
                        <Text size18 fontBold slateGrey>
                            Sobre a ação
                        </Text>
                    }
                >
                    <Spacer horizontal={4}>
                        <ComponentConnect path={`planoAcaoItem.formPlanoAcaoItem.descricao`}>
                            <TextInputPaper
                                mode="outlined"
                                label={somenteDetalhar ? 'Detalhar ação' : 'Descrição da ação'}
                                multiline
                                numberOfLines={6}
                                disabled={
                                    !permiteAlterar ||
                                    !permiteAlterarDescricao ||
                                    this.verificaPlanoColetivoUnidadeProdutiva()
                                }
                            />
                        </ComponentConnect>

                        {!somenteDetalhar && (
                            <ComponentConnect path={`planoAcaoItem.formPlanoAcaoItem.status`}>
                                <DropdownPaper
                                    mode="outlined"
                                    label={'Status da Ação'}
                                    data={PLANO_ACAO_ITEM_STATUS}
                                    disabled={!permiteAlterar}
                                />
                            </ComponentConnect>
                        )}

                        <ComponentConnect path={`planoAcaoItem.formPlanoAcaoItem.prazo`}>
                            <TextInputPaper
                                mode="outlined"
                                label="Prazo da Ação"
                                helperText="Formato da data: Dia/Mês/Ano. Ex: 31/12/2000"
                                mask="99/99/9999"
                                maxLength={10}
                                keyboardType="numeric"
                                disabled={!permiteAlterar || this.verificaPlanoColetivoUnidadeProdutiva()}
                            />
                        </ComponentConnect>

                        {!somenteDetalhar && (
                            <ComponentConnect path={`planoAcaoItem.formPlanoAcaoItem.prioridade`}>
                                <DropdownPaper
                                    mode="outlined"
                                    label={'Prioridade da Ação'}
                                    data={PLANO_ACAO_ITEM_PRIORIDADES}
                                    disabled={!permiteAlterar || this.verificaPlanoColetivoUnidadeProdutiva()}
                                />
                            </ComponentConnect>
                        )}
                    </Spacer>
                </CollapsibleContent>
            </Spacer>
        );
    }

    renderObservacoes() {
        const {
            fieldPlanoAcaoItemId,
            countPlanoAcaoItemHistoricos,
            permissoesFormPlanoAcaoItem: { permiteHistorico },
        } = this.props;

        if (!fieldPlanoAcaoItemId.value && permiteHistorico) {
            return (
                <Spacer horizontal={0} vertical={2} style={styles.box}>
                    <CollapsibleContent
                        collapsed={false}
                        header={
                            <Text size18 fontBold slateGrey>
                                Acompanhamento Inicial
                            </Text>
                        }
                    >
                        <Spacer horizontal={4}>
                            <ComponentConnect path={`planoAcaoItem.formPlanoAcaoItem.observacao_inicial`}>
                                <TextInputPaper mode="outlined" label="Acompanhamento Inicial" />
                            </ComponentConnect>
                        </Spacer>
                    </CollapsibleContent>
                </Spacer>
            );
        }

        return (
            <QueryDb query={QUERY_OBSERVACOES} params={[fieldPlanoAcaoItemId.value]} key={countPlanoAcaoItemHistoricos}>
                {(data) => (
                    <BoxObservacoes
                        data={data}
                        fieldTextoPath={'planoAcaoItem.formObservacao.texto'}
                        onSalvarPress={this.onSalvarObservacaoPress.bind(this)}
                        permiteHistorico={permiteHistorico}
                    />
                )}
            </QueryDb>
        );
    }

    render() {
        const { loading } = this.state;
        const {
            formPlanoAcaoItem,
            formObservacao,
            permissoesFormPlanoAcaoItem: { permiteAlterar, permiteReabrir, permiteExcluir, somenteDetalhar },
        } = this.props;
        const { planoAcaoId } = this.props.match.params;

        if (loading) {
            return <Loading />;
        }

        // Só pode renderizar quando o cadastro/edição estiver liberado pelo signal no cerebral
        if (!formPlanoAcaoItem.plano_acao_id.value) {
            return null;
        }

        let salvarObservacao = !!formObservacao.texto.value;

        return (
            <View style={styles.root}>
                <QueryDb query={QUERY_PLANO_ACAO} params={[planoAcaoId]} returnFirst={true}>
                    {(planoAcao) => {
                        return (
                            planoAcao && (
                                <>
                                    <View style={styles.header}>
                                        <HeaderMenu title={`Detalhes da Ação`} />
                                        <Spacer vertical={0} horizontal={2}>
                                            <PlanoAcaoItem
                                                nome={planoAcao.planoAcaoNome}
                                                unidadeProdutiva={planoAcao.unidadeProdutivaNome}
                                                produtor={planoAcao.produtorNome}
                                                coproprietario={planoAcao.unidadeProdutivaSocios}
                                            />
                                        </Spacer>
                                    </View>

                                    <ScrollView style={styles.content}>
                                        {this.renderSobre()}

                                        {!!formPlanoAcaoItem.checklist_pergunta_id.value &&
                                            this.renderDadosChecklist(planoAcao.planoAcaoStatus)}

                                        {!somenteDetalhar && this.renderObservacoes()}

                                        <View style={styles.footer}>
                                            {permiteReabrir && (
                                                <>
                                                    <Button
                                                        mode="contained"
                                                        onPress={this.onReabrirPress.bind(this)}
                                                        style={styles.footerButtons}
                                                    >
                                                        REABRIR AÇÃO
                                                    </Button>
                                                    <Spacer />
                                                </>
                                            )}

                                            <ViewSmart row>
                                                <Button
                                                    mode="contained"
                                                    onPress={this.onCancelarPress.bind(this)}
                                                    style={styles.footerButtons}
                                                >
                                                    {permiteAlterar ? 'CANCELAR' : 'VOLTAR'}
                                                </Button>

                                                {permiteExcluir && (
                                                    <>
                                                        <Spacer />
                                                        <Button
                                                            mode="contained"
                                                            onPress={this.onExcluirPress.bind(this)}
                                                            style={styles.excluirButton}
                                                        >
                                                            EXCLUIR AÇÃO
                                                        </Button>
                                                    </>
                                                )}
                                            </ViewSmart>

                                            {permiteAlterar && (
                                                <>
                                                    <Spacer />
                                                    <Button
                                                        mode="contained"
                                                        onPress={
                                                            salvarObservacao
                                                                ? this.onSalvarObservacaoPress.bind(this)
                                                                : this.onSalvarPress.bind(this)
                                                        }
                                                        onDisabledPress={this.onSalvarDisabledPress.bind(this)}
                                                        disabled={!formPlanoAcaoItem.isValid && !salvarObservacao}
                                                        style={styles.footerButtons}
                                                    >
                                                        {salvarObservacao ? 'SALVAR OBSERVAÇÃO' : 'SALVAR E VOLTAR'}
                                                    </Button>
                                                </>
                                            )}
                                        </View>
                                    </ScrollView>
                                </>
                            )
                        );
                    }}
                </QueryDb>
            </View>
        );
    }
}

export default connect(
    {
        fieldPlanoAcaoItemId: field(state`planoAcaoItem.formPlanoAcaoItem.id`),
        formPlanoAcaoItem: form(state`planoAcaoItem.formPlanoAcaoItem`),
        formObservacao: form(state`planoAcaoItem.formObservacao`),
        countPlanoAcaoItemHistoricos: state`planoAcaoItem.countPlanoAcaoItemHistoricos`,
        permissoesFormPlanoAcaoItem: state`planoAcaoItem.permissoesFormPlanoAcaoItem`,
        signalFetchPlanoAcaoItem: signal`planoAcaoItem.fetchPlanoAcaoItem`,
        signalIniciarCadastroPlanoAcaoItem: signal`planoAcaoItem.iniciarCadastroPlanoAcaoItem`,
        signalSalvarPlanoAcaoItem: signal`planoAcaoItem.salvarPlanoAcaoItem`,
        signalExcluirPlanoAcaoItem: signal`planoAcaoItem.excluirPlanoAcaoItem`,
        signalReabrirPlanoAcaoItem: signal`planoAcaoItem.reabrirPlanoAcaoItem`,
        signalSalvarObservacao: signal`planoAcaoItem.salvarObservacaoItem`,
        signalResetPlanoAcaoItem: signal`planoAcaoItem.resetPlanoAcaoItem`,
        signalTouchForm: signal`form.touchForm`,
        signalTouchedField: signal`form.touchedField`,
    },
    DadosPlanoAcaoPage
);
