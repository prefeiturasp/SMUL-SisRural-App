import { form } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { View } from 'react-native';
import { BASE_URL } from 'react-native-dotenv';
import { ScrollView } from 'react-native-gesture-handler';
import {
    ActionRoute,
    Button,
    CollapsibleContent,
    ComponentConnect,
    DownloadablePdfShareButton,
    DropdownPaper,
    HeaderMenu,
    Loading,
    QueryDb,
    Spacer,
    Text,
    TextInputPaper,
} from '../../../components';
import { PLANO_ACAO_DETALHAMENTO_STATUS, PLANO_ACAO_STATUS } from '../../../modules/PlanoAcaoModule';
import { makePromise } from '../../../utils/CerebralUtil';
import BoxAcoes from '../components/boxAcoes/BoxAcoes';
import BoxObservacoes from '../components/boxObservacoes/BoxObservacoes';
import BoxUnidadesProdutivas from '../components/boxUnidadesProdutivas/BoxUnidadesProdutivas';
import PlanoAcaoItem from '../components/planoAcaoItem/PlanoAcaoItem';
import styles from './DadosPlanoAcaoPage.styles';

const QUERY_UNIDADE_PRODUTIVAS = `
SELECT
	UP.nome as 'nome',
    UP.socios as 'socios'
FROM	
    unidade_produtivas UP
WHERE
        UP.id = :id	
`;

const QUERY_PRODUTORES = `
SELECT
	P.nome as 'nome'
FROM
	produtores P
WHERE
        P.id = :id
`;

const QUERY_OBSERVACOES = `
SELECT
	pah.texto,
	pah.created_at
FROM
	plano_acao_historicos pah	
WHERE
		pah.plano_acao_id = :plano_acao_id
	AND pah.deleted_at is null
`;

const QUERY_INSTRUCOES_PREENCHIMENTO = `
SELECT C.instrucoes_pda
  FROM checklists C,
       checklist_unidade_produtivas CUP 
 WHERE C.id = CUP.checklist_id
   AND C.deleted_at IS NULL
   AND CUP.deleted_at IS NULL
   AND CUP.id = :checklist_unidade_produtiva_id 
`;

class DadosPlanoAcaoPage extends React.Component {
    static propTypes = {};

    constructor(props) {
        super(props);
        this.state = { loading: false };
    }

    componentDidMount() {
        const { planoAcaoId, unidadeProdutivaId, produtorId, checklistUnidadeProdutivaId } = this.props.match.params;
        let planoAcaoColetivoId;
        if (this.props.location.state) {
            planoAcaoColetivoId = this.props.location.state.planoAcaoColetivoId;
        }

        const onComplete = this.makeLoadingPromise();

        if (planoAcaoColetivoId) {
            this.props.signalInserirUnidadeProdutivaPlanoAcaoColetivo({
                planoAcaoId: planoAcaoColetivoId,
                unidadeProdutivaId,
                produtorId,
                onComplete,
            });
        } else if (planoAcaoId) {
            this.props.signalFetchPlanoAcao({ planoAcaoId, onComplete });
        } else if (unidadeProdutivaId && produtorId) {
            this.props.signalIniciarCadastroPlanoAcao({
                unidadeProdutivaId,
                produtorId,
                checklistUnidadeProdutivaId: checklistUnidadeProdutivaId ? checklistUnidadeProdutivaId : null,
                onComplete,
            });
        } else {
            this.props.signalIniciarCadastroPlanoAcao({ coletivo: true, onComplete });
        }
    }

    componentDidUpdate(prevProps) {
        const { signalFetchPlanoAcao } = this.props;
        const { planoAcaoId } = this.props.match.params;
        const { planoAcaoId: oldPlanoAcaoId } = prevProps.match.params;

        if (planoAcaoId && (!oldPlanoAcaoId || oldPlanoAcaoId != planoAcaoId) && signalFetchPlanoAcao) {
            signalFetchPlanoAcao({ planoAcaoId, onComplete: this.makeLoadingPromise() });
        }
    }

    makeLoadingPromise() {
        const { promise, id } = makePromise();

        this.setState({ loading: true });
        promise.then((data) => {
            this.setState({ loading: false });
        });

        return id;
    }

    componentWillUnmount() {
        this.props.signalResetPlanoAcao();
    }

    onSalvarPress() {
        const { formBasico, signalSalvarPlanoAcao } = this.props;
        const { id: fieldPlanoAcaoId } = formBasico;

        const onComplete = this.makeLoadingPromise();
        const tipoFormulario = fieldPlanoAcaoId.value ? 'completo' : 'basico';

        signalSalvarPlanoAcao({ tipoFormulario, mostrarConfirmacao: true, syncAposSalvar: true, onComplete });
    }

    onSalvarDisabledPress() {
        const { formBasico } = this.props;
        const { id: fieldPlanoAcaoId } = formBasico;
        const formPath = fieldPlanoAcaoId.value ? 'planoAcao.formCompleto' : 'planoAcao.formBasico';
        this.props.signalTouchForm({ form: formPath });
    }

    onReabrirPress() {
        const { signalReabrirPlanoAcao } = this.props;
        signalReabrirPlanoAcao({ onComplete: this.makeLoadingPromise() });
    }

    onExcluirPress() {
        const { signalExcluirPlanoAcao } = this.props;
        signalExcluirPlanoAcao();
    }

    onVoltarPress(coletivo) {
        if (coletivo) {
            ActionRoute.replace('/home');
        } else {
            ActionRoute.back();
        }
    }

    onAdicionarUnidadeProdutivaPlanoAcaoColetivoPress() {
        const { formCompleto, signalAdicionarUnidadeProdutivaPlanoAcaoColetivo, signalTouchForm } = this.props;

        signalTouchForm({ form: 'planoAcao.formCompleto' });
        if (formCompleto.isValid) {
            signalAdicionarUnidadeProdutivaPlanoAcaoColetivo({
                onComplete: this.makeLoadingPromise(),
            });
        }
    }

    onUnidadeProdutivaPlanoAcaoColetivoPress(planoAcaoUnidadeId) {
        const { formCompleto, signalSalvarPlanoAcao, signalTouchForm } = this.props;

        signalTouchForm({ form: 'planoAcao.formCompleto' });
        if (formCompleto.isValid) {
            signalSalvarPlanoAcao({
                tipoFormulario: 'completo',
                redirectRouteAposSalvar: `/planoAcao/${planoAcaoUnidadeId}`,
                onComplete: this.makeLoadingPromise(),
            });
        }
    }

    onAdicionarAcaoPress() {
        const { formCompleto, signalSalvarPlanoAcao, signalTouchForm } = this.props;
        const { id: fieldPlanoAcaoId } = formCompleto;

        signalTouchForm({ form: 'planoAcao.formCompleto' });
        if (formCompleto.isValid) {
            signalSalvarPlanoAcao({
                tipoFormulario: 'completo',
                redirectRouteAposSalvar: `/planoAcaoItem/${fieldPlanoAcaoId.value}`,
                onComplete: this.makeLoadingPromise(),
            });
        }
    }

    onEditarAcaoPress(planoAcaoItemId) {
        const {
            formBasico,
            signalSalvarPlanoAcao,
            permissoesFormPlanoAcao: { permiteAlterar },
        } = this.props;
        const { id: fieldPlanoAcaoId } = formBasico;

        if (permiteAlterar) {
            signalSalvarPlanoAcao({
                tipoFormulario: 'completo',
                redirectRouteAposSalvar: `/planoAcaoItem/${fieldPlanoAcaoId.value}/${planoAcaoItemId}`,
                onComplete: this.makeLoadingPromise(),
            });
        } else {
            ActionRoute.go(`/planoAcaoItem/${fieldPlanoAcaoId.value}/${planoAcaoItemId}`);
        }
    }

    onSalvarObservacaoPress() {
        const { formObservacao, signalTouchForm, signalSalvarObservacao } = this.props;

        signalTouchForm({ form: 'planoAcao.formObservacao' });
        if (!formObservacao.isValid) {
            return;
        }

        signalSalvarObservacao();
    }

    renderInstrucoesPreenchimento() {
        const { formBasico } = this.props;
        const { checklist_unidade_produtiva_id: fieldChecklistUnidadeProdutivaId } = formBasico;

        if (!fieldChecklistUnidadeProdutivaId.value) {
            return null;
        }

        return (
            <QueryDb
                query={QUERY_INSTRUCOES_PREENCHIMENTO}
                params={[fieldChecklistUnidadeProdutivaId.value]}
                returnFirst
            >
                {(data) => (
                    <Spacer horizontal={0} vertical={2} style={styles.box}>
                        <CollapsibleContent
                            collapsed={false}
                            header={
                                <Text size18 fontBold slateGrey>
                                    Instruções Gerais
                                </Text>
                            }
                        >
                            <Spacer horizontal={4} bottom={4} top={0}>
                                <Text size14 slateGrey>
                                    {!!data && !!data.instrucoes_pda ? data.instrucoes_pda : 'Não há'}
                                </Text>
                            </Spacer>
                        </CollapsibleContent>
                    </Spacer>
                )}
            </QueryDb>
        );
    }

    renderInformacoesGerais() {
        const {
            formBasico,
            permissoesFormPlanoAcao: { permiteAlterar, somenteDetalhar },
        } = this.props;
        const { id: fieldPlanoAcaoId } = formBasico;
        const formPath = fieldPlanoAcaoId.value ? 'planoAcao.formCompleto' : 'planoAcao.formBasico';

        let availableStatus = PLANO_ACAO_STATUS;
        if (permiteAlterar) {
            // Se permite alterar, retira do combo os status que não permitem seleção com base na situação atual do PDA/Checklist
            availableStatus = availableStatus.filter((s) => s.value != 'aguardando_aprovacao');
            if (somenteDetalhar) {
                availableStatus = availableStatus
                    .filter((s) => ['rascunho', 'nao_iniciado'].includes(s.value))
                    .map((s) => (s.value != 'nao_iniciado' ? s : { ...s, label: 'Prosseguir' }));
            } else {
                availableStatus = availableStatus
                    .filter((s) => s.value != 'rascunho')
                    .map((s) =>
                        s.value != 'nao_iniciado' || permiteAlterar ? s : { ...s, label: 'Aguardando Aprovação' }
                    );
            }
        }

        return (
            <Spacer horizontal={0} vertical={2} style={styles.box}>
                <CollapsibleContent
                    collapsed={false}
                    header={
                        <Text size18 fontBold slateGrey>
                            Informações Gerais
                        </Text>
                    }
                >
                    <Spacer horizontal={4}>
                        <ComponentConnect path={`${formPath}.nome`}>
                            <TextInputPaper
                                mode="outlined"
                                label="Título do Plano de Ação"
                                disabled={!permiteAlterar}
                            />
                        </ComponentConnect>

                        <ComponentConnect path={`${formPath}.prazo`}>
                            <TextInputPaper
                                mode="outlined"
                                label="Prazo do Plano de Ação"
                                helperText="Formato da data: Dia/Mês/Ano. Ex: 31/12/2000"
                                mask="99/99/9999"
                                maxLength={10}
                                keyboardType="numeric"
                                disabled={!permiteAlterar}
                            />
                        </ComponentConnect>

                        {/* Não aparece o bloco de status quando for PDA Formulário - Detalhamento */}
                        {!!fieldPlanoAcaoId.value && !somenteDetalhar && (
                            <ComponentConnect path={`${formPath}.status`}>
                                <DropdownPaper
                                    mode="outlined"
                                    label={'Status'}
                                    data={availableStatus}
                                    disabled={!permiteAlterar}
                                />
                            </ComponentConnect>
                        )}
                    </Spacer>
                </CollapsibleContent>
            </Spacer>
        );
    }

    renderAcoes() {
        const {
            formBasico,
            permissoesFormPlanoAcao: { permiteAlterar, somenteDetalhar },
        } = this.props;

        const {
            id: fieldPlanoAcaoId,
            checklist_unidade_produtiva_id: fieldChecklistUnidadeProdutivaId,
            plano_acao_coletivo_id: fieldPlanoAcaoColetivoId,
            fl_coletivo: fieldColetivo,
        } = formBasico;

        let titulo = 'Ações';
        let subtitulo = '';
        if (somenteDetalhar) {
            titulo = 'Ações cadastradas';
        } else if (fieldColetivo.value && !fieldPlanoAcaoColetivoId.value) {
            titulo = 'Ações coletivas';
            subtitulo = 'Alterações neste bloco aplicam-se a todas as UPAs deste plano';
        }

        return (
            <BoxAcoes
                titulo={titulo}
                subtitulo={subtitulo}
                planoAcaoId={fieldPlanoAcaoId.value}
                detalharAcoes={somenteDetalhar}
                permiteAdicionar={permiteAlterar && !fieldChecklistUnidadeProdutivaId.value}
                onAdicionarAcaoPress={this.onAdicionarAcaoPress.bind(this)}
                onEditarAcaoPress={this.onEditarAcaoPress.bind(this)}
            />
        );
    }

    renderUnidadesProdutivas() {
        const {
            formBasico,
            permissoesFormPlanoAcao: { permiteAlterar },
        } = this.props;
        const { id: fieldPlanoAcaoId, checklist_unidade_produtiva_id: fieldChecklistUnidadeProdutivaId } = formBasico;

        return (
            <BoxUnidadesProdutivas
                planoAcaoId={fieldPlanoAcaoId.value}
                permiteAdicionar={permiteAlterar && !fieldChecklistUnidadeProdutivaId.value}
                onAdicionarUnidadeProdutivaPlanoAcaoColetivoPress={this.onAdicionarUnidadeProdutivaPlanoAcaoColetivoPress.bind(
                    this
                )}
                onUnidadeProdutivaPlanoAcaoColetivoPress={this.onUnidadeProdutivaPlanoAcaoColetivoPress.bind(this)}
            />
        );
    }

    renderObservacoes() {
        const { formBasico, countPlanoAcaoHistoricos } = this.props;
        const { id: fieldPlanoAcaoId } = formBasico;

        const {
            permissoesFormPlanoAcao: { permiteHistorico },
        } = this.props;

        return (
            <QueryDb query={QUERY_OBSERVACOES} params={[fieldPlanoAcaoId.value]} key={countPlanoAcaoHistoricos}>
                {(data) => (
                    <BoxObservacoes
                        data={data}
                        fieldTextoPath={'planoAcao.formObservacao.texto'}
                        onSalvarPress={this.onSalvarObservacaoPress.bind(this)}
                        permiteHistorico={permiteHistorico}
                    />
                )}
            </QueryDb>
        );
    }

    renderEtapaPlanoAcaoStatus = () => {
        const {
            permissoesFormPlanoAcao: { permiteAlterar },
        } = this.props;

        return (
            <Spacer horizontal={0} vertical={2} style={styles.box}>
                <CollapsibleContent
                    collapsed={false}
                    header={
                        <Text size18 fontBold slateGrey>
                            Etapa do Plano de Ação
                        </Text>
                    }
                >
                    <Spacer horizontal={4}>
                        <Text size14 slateGrey>
                            Mantenha em rascunho para detalhar as ações. Use "Prosseguir" para iniciar o acompanhamento
                            do Plano de Ação ou enviar para aprovação, se for o caso.
                        </Text>

                        <Spacer vertical={2} />

                        <ComponentConnect path={`planoAcao.formCompleto.status`}>
                            <DropdownPaper
                                mode="outlined"
                                label={'Status'}
                                data={PLANO_ACAO_DETALHAMENTO_STATUS}
                                disabled={!permiteAlterar}
                            />
                        </ComponentConnect>
                    </Spacer>
                </CollapsibleContent>
            </Spacer>
        );
    };

    renderPlanoAcao(planoAcaoId, unidadeProdutiva, produtor, coletivoPai, coletivoFilho) {
        const {
            formBasico,
            formCompleto,
            formObservacao,
            permissoesFormPlanoAcao: {
                permiteAlterar,
                permiteHistorico,
                permiteReabrir,
                permiteExcluir,
                permiteCompartilhar,
                somenteDetalhar,
            },
            userId,
        } = this.props;

        let salvarDisabled = planoAcaoId ? !formCompleto.isValid : !formBasico.isValid;
        let salvarObservacao = !!formObservacao.texto.value;

        return (
            <React.Fragment key={planoAcaoId ? planoAcaoId : ''}>
                <View style={styles.header}>
                    <HeaderMenu title={`Plano de Ação${coletivoPai || coletivoFilho ? ' Coletivo' : ''}`} />
                    <Spacer vertical={0} horizontal={2}>
                        {!coletivoPai && (
                            <PlanoAcaoItem
                                nome={coletivoFilho ? formCompleto.nome.value : null}
                                unidadeProdutiva={unidadeProdutiva.nome}
                                produtor={produtor.nome}
                                coproprietario={unidadeProdutiva.socios}
                            />
                        )}
                    </Spacer>
                </View>

                <ScrollView style={styles.content}>
                    {!!planoAcaoId && this.renderInstrucoesPreenchimento()}
                    {!coletivoFilho && this.renderInformacoesGerais()}
                    {!!planoAcaoId && coletivoPai && !somenteDetalhar && this.renderUnidadesProdutivas()}
                    {!!planoAcaoId && this.renderAcoes()}
                    {!!planoAcaoId && !somenteDetalhar && this.renderObservacoes()}
                    {/* TODO: ver com o RAFA se quando estiver no fluxo de aprovação do checklist o usuário pode colocar observações */}
                    {!!somenteDetalhar && this.renderEtapaPlanoAcaoStatus()}

                    <View style={styles.footer}>
                        {!!permiteReabrir && (
                            <>
                                <Button mode="contained" onPress={this.onReabrirPress.bind(this)}>
                                    REABRIR PLANO DE AÇÃO
                                </Button>
                                <Spacer />
                            </>
                        )}

                        {!!permiteAlterar && (
                            <>
                                <Button
                                    mode="contained"
                                    disabled={salvarDisabled && !salvarObservacao}
                                    onPress={
                                        salvarObservacao // quando possui algum texto no campo observação, altera a função do botão para salvar a observação
                                            ? this.onSalvarObservacaoPress.bind(this)
                                            : this.onSalvarPress.bind(this)
                                    }
                                    onDisabledPress={this.onSalvarDisabledPress.bind(this)}
                                >
                                    {salvarObservacao ? 'SALVAR ACOMPANHAMENTO' : 'SALVAR'}
                                </Button>
                                <Spacer />
                            </>
                        )}

                        {!!permiteCompartilhar && (
                            <DownloadablePdfShareButton
                                url={`${BASE_URL}/pda/pdf/${planoAcaoId}/${userId}`}
                                pdfFileName="plano.pdf"
                            />
                        )}

                        {!!formBasico.checklist_unidade_produtiva_id.value && (
                            <>
                                <Button
                                    mode="contained"
                                    onPress={() =>
                                        ActionRoute.go(
                                            `/editarChecklist/${formBasico.checklist_unidade_produtiva_id.value}`
                                        )
                                    }
                                >
                                    VER FORMULÁRIO
                                </Button>
                                <Spacer />
                            </>
                        )}

                        <Button mode="contained" onPress={this.onVoltarPress.bind(this, coletivoPai)}>
                            {!planoAcaoId ? 'CANCELAR' : coletivoPai ? 'VOLTAR PARA TELA INICIAL' : 'VOLTAR'}
                        </Button>

                        {!!permiteExcluir && (
                            <>
                                <Spacer />
                                <Button
                                    mode="contained"
                                    onPress={this.onExcluirPress.bind(this)}
                                    style={styles.excluirButton}
                                >
                                    {coletivoFilho
                                        ? 'EXCLUIR UNIDADE PRODUTIVA'
                                        : coletivoPai
                                        ? 'EXCLUIR PLANO DE AÇÃO COLETIVO'
                                        : 'EXCLUIR PLANO DE AÇÃO'}
                                </Button>
                            </>
                        )}
                    </View>
                </ScrollView>
            </React.Fragment>
        );
    }

    render() {
        const { loading } = this.state;
        const { formBasico } = this.props;
        const {
            id: fieldPlanoAcaoId,
            unidade_produtiva_id: fieldUnidadeProdutivaId,
            produtor_id: fieldProdutorId,
            fl_coletivo: fieldColetivo,
            plano_acao_coletivo_id: fieldPlanoAcaoColetivoId,
        } = formBasico;

        if (loading) {
            return <Loading />;
        }

        // quando for coletivo (agregador) renderiza com dados diferentes - sem cabeçalho
        if (fieldColetivo.value == 1 && !fieldPlanoAcaoColetivoId.value) {
            return this.renderPlanoAcao(fieldPlanoAcaoId.value, null, null, true, false);
        }

        if (!fieldUnidadeProdutivaId.value || !fieldProdutorId.value) {
            return null;
        }

        return (
            <View style={styles.root} key={fieldPlanoAcaoId.value ? fieldPlanoAcaoId.value : ''}>
                <QueryDb query={QUERY_UNIDADE_PRODUTIVAS} params={[fieldUnidadeProdutivaId.value]} returnFirst={true}>
                    {(unidadeProdutiva) => (
                        <QueryDb query={QUERY_PRODUTORES} params={[fieldProdutorId.value]} returnFirst={true}>
                            {(produtor) =>
                                this.renderPlanoAcao(
                                    fieldPlanoAcaoId.value,
                                    unidadeProdutiva,
                                    produtor,
                                    false,
                                    fieldColetivo.value == 1
                                )
                            }
                        </QueryDb>
                    )}
                </QueryDb>
            </View>
        );
    }
}

export default connect(
    {
        formBasico: form(state`planoAcao.formBasico`),
        formCompleto: form(state`planoAcao.formCompleto`),
        formObservacao: form(state`planoAcao.formObservacao`),
        countPlanoAcaoHistoricos: state`planoAcao.countPlanoAcaoHistoricos`,
        permissoesFormPlanoAcao: state`planoAcao.permissoesFormPlanoAcao`,
        userId: state`auth.user.id`,

        signalIniciarCadastroPlanoAcao: signal`planoAcao.iniciarCadastroPlanoAcao`,
        signalFetchPlanoAcao: signal`planoAcao.fetchPlanoAcao`,
        signalSalvarPlanoAcao: signal`planoAcao.salvarPlanoAcao`,
        signalExcluirPlanoAcao: signal`planoAcao.excluirPlanoAcao`,
        signalReabrirPlanoAcao: signal`planoAcao.reabrirPlanoAcao`,
        signalSalvarObservacao: signal`planoAcao.salvarObservacao`,
        signalAdicionarUnidadeProdutivaPlanoAcaoColetivo: signal`planoAcao.adicionarUnidadeProdutivaPlanoAcaoColetivo`, // quando o usuário pressiona o botão adicionar
        signalInserirUnidadeProdutivaPlanoAcaoColetivo: signal`planoAcao.inserirUnidadeProdutivaPlanoAcaoColetivo`, // quando retorna da tela de selecionar produtor/unidade produtiva
        signalResetPlanoAcao: signal`planoAcao.resetPlanoAcao`,
        signalTouchForm: signal`form.touchForm`,
    },
    DadosPlanoAcaoPage
);
