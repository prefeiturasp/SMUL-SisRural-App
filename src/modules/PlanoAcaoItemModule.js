import { Module } from 'cerebral';
import { set, when } from 'cerebral/operators';
import { props, state } from 'cerebral/tags';
import moment from 'moment';
import { ActionRoute } from '../components';
import { setFormData } from '../utils/CerebralUtil';
import { modal } from './addons';
import { createSyncFlow } from './DBModule';
import resetFormCustom from './form/resetFormCustom';
import { toast } from './ToastModule';

export const PLANO_ACAO_ITEM_STATUS = [
    { value: 'nao_iniciado', label: 'Não iniciado', icon: 'naoIniciado' },
    { value: 'em_andamento', label: 'Em andamento', icon: 'emAndamento' },
    { value: 'concluido', label: 'Concluído', icon: 'concluido' },
    { value: 'cancelado', label: 'Cancelado', icon: 'cancelado' },
];
export const PLANO_ACAO_ITEM_PRIORIDADES = [
    { value: 'atendida', label: 'Atendida', icon: 'atendida' },
    { value: 'acao_recomendada', label: 'Ação Recomendada', icon: 'recomendada' },
    { value: 'priorizacao_tecnica', label: 'Priorização Técnica', icon: 'prioritaria' },
];

const resetFormPlanoAcaoItem = [
    resetFormCustom(state`planoAcaoItem.formPlanoAcaoItem`),
    set(state`planoAcaoItem.countPlanoAcaoItemHistoricos`, 0),
    set(state`planoAcaoItem.permissoesFormPlanoAcaoItem`, createPermissoesFormPlanoAcaoItem()),
];

const iniciarCadastroPlanoAcaoItem = [
    resetFormPlanoAcaoItem,
    async ({ props, db }) => {
        props.flColetivo = 0;
        props.planoAcaoItemColetivoId = '';

        const [resultPlanoAcao] = await db.exec('SELECT fl_coletivo, prazo FROM plano_acoes WHERE id = :id', [
            props.planoAcaoId,
        ]);
        if (resultPlanoAcao.rows.length > 0) {
            props.flColetivo = resultPlanoAcao.rows.item(0).fl_coletivo;
            props.prazo = dateToDisplay(resultPlanoAcao.rows.item(0).prazo);
        }
    },
    set(state`planoAcaoItem.formPlanoAcaoItem.plano_acao_id.value`, props`planoAcaoId`),
    set(state`planoAcaoItem.formPlanoAcaoItem.fl_coletivo.value`, props`flColetivo`),
    set(state`planoAcaoItem.formPlanoAcaoItem.prazo.value`, props`prazo`),
    set(state`planoAcaoItem.formPlanoAcaoItem.prioridade.value`, 'priorizacao_tecnica'),
    set(state`planoAcaoItem.formPlanoAcaoItem.status.value`, 'nao_iniciado'),
    set(state`planoAcaoItem.permissoesFormPlanoAcaoItem.permiteAlterar`, true),
    set(state`planoAcaoItem.permissoesFormPlanoAcaoItem.permiteHistorico`, true),
    set(state`planoAcaoItem.permissoesFormPlanoAcaoItem.permiteAlterarDescricao`, true),
];

// Sincroniza nos itens dos planos de ação filhos as informações criadas/atualizadas - se for novo item, gera para cada unidade produtiva, se for um item existente, sincroniza com o item pai
const sincronizarItemPlanoAcaoColetivo = [
    when(props`novoItemPlanoAcao`, (novo) => !!novo),
    {
        true: [
            async ({ props, db }) => {
                const [data] = await db.exec('SELECT * FROM plano_acoes WHERE plano_acao_coletivo_id = :id', [
                    props.itemPlanoAcaoColetivoPai.plano_acao_id,
                ]);
                if (data.rows.length > 0) {
                    await Promise.all(
                        data.rows.raw().map(async (planoFilho) => {
                            const acaoFilho = { ...props.itemPlanoAcaoColetivoPai };
                            acaoFilho.id = null;
                            acaoFilho.plano_acao_item_coletivo_id = props.planoAcaoItemId;
                            acaoFilho.plano_acao_id = planoFilho.id;
                            acaoFilho.app_sync = 1;

                            await db.insertOrUpdate('plano_acao_itens', acaoFilho);
                        })
                    );
                }
            },
        ],
        false: [
            async ({ props, db, state }) => {
                const [data] = await db.exec('SELECT * FROM plano_acao_itens WHERE plano_acao_item_coletivo_id = :id', [
                    props.itemPlanoAcaoColetivoPai.id,
                ]);
                if (data.rows.length > 0) {
                    await Promise.all(
                        data.rows.raw().map(async (itemPlanoFilho) => {
                            itemPlanoFilho.app_sync = 1;
                            itemPlanoFilho.descricao = props.itemPlanoAcaoColetivoPai.descricao;
                            itemPlanoFilho.prioridade = props.itemPlanoAcaoColetivoPai.prioridade;
                            itemPlanoFilho.status = props.itemPlanoAcaoColetivoPai.status;
                            itemPlanoFilho.prazo = props.itemPlanoAcaoColetivoPai.prazo;

                            await db.insertOrUpdate('plano_acao_itens', itemPlanoFilho);

                            if (props.textoAlteracaoStatus) {
                                const observacaoData = {
                                    plano_acao_item_id: itemPlanoFilho.id,
                                    user_id: state.get('auth.user.id'),
                                    texto: props.textoAlteracaoStatus,
                                    app_sync: 1,
                                };

                                await db.insertOrUpdate('plano_acao_item_historicos', observacaoData);
                            }
                        })
                    );
                }
            },
        ],
    },
];

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

const fetchPlanoAcaoItem = [
    async ({ db, props, state }) => {
        const [data] = await db.exec(
            `SELECT PAI.*, 
                    PA.status as statusPlanoAcao,
                    PA.checklist_unidade_produtiva_id checklistUnidadeProdutivaId,
                    CUP.status as statusChecklistUnidadeProdutiva, 
                    CUP.status_flow as statusFlowChecklistUnidadeProdutiva
            FROM plano_acao_itens PAI,
                 plano_acoes PA
                 LEFT JOIN checklist_unidade_produtivas CUP ON CUP.id = PA.checklist_unidade_produtiva_id
            WHERE PAI.id = :id
                AND PA.id = PAI.plano_acao_id`,
            [props.planoAcaoItemId]
        );

        if (data.rows.length > 0) {
            const planoAcaoItem = data.rows.item(0);
            planoAcaoItem.prazo = dateToDisplay(planoAcaoItem.prazo);

            await countPlanoAcaoItemHistoricos(planoAcaoItem.id, state, db);

            //Zera a resposta caso seja igual ao plano de ação default
            if (planoAcaoItem.checklist_pergunta_id && planoAcaoItem.statusPlanoAcao == 'rascunho') {
                const [dataPlanoDefault] = await db.exec(QUERY_PERGUNTA_CHECKLIST, [
                    planoAcaoItem.plano_acao_id,
                    planoAcaoItem.checklist_snapshot_resposta_id,
                    planoAcaoItem.checklist_pergunta_id,
                ]);

                if (dataPlanoDefault.rows.length > 0) {
                    const planoAcaoDefault = dataPlanoDefault.rows.item(0);
                    if (planoAcaoDefault.plano_acao_default == planoAcaoItem.descricao) {
                        planoAcaoItem.descricao = '';
                    }
                }
            }

            setFormData('planoAcaoItem.formPlanoAcaoItem', planoAcaoItem, state);

            if (
                planoAcaoItem.statusPlanoAcao != 'aguardando_aprovacao' &&
                (planoAcaoItem.status == 'nao_iniciado' || planoAcaoItem.status == 'em_andamento')
            ) {
                // ver abaixo pois o indicador de permiteAlterar pode ser modificado dependendo do checklist quando for o caso
                state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteAlterar', true);
                state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteAlterarDescricao', true);
            }

            if (
                (planoAcaoItem.status == 'concluido' || planoAcaoItem.status == 'cancelado') &&
                (planoAcaoItem.statusPlanoAcao == 'nao_iniciado' || planoAcaoItem.statusPlanoAcao == 'em_andamento')
            ) {
                state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteReabrir', true);
            }

            if (
                (planoAcaoItem.fl_coletivo == 0 && !planoAcaoItem.checklist_pergunta_id) ||
                (planoAcaoItem.fl_coletivo == 1 && !planoAcaoItem.plano_acao_item_coletivo_id)
            ) {
                state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteExcluir', true);
            }

            if (planoAcaoItem.statusPlanoAcao == 'rascunho') {
                state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.somenteDetalhar', true);
                state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteAlterar', true);
                state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteAlterarDescricao', true);
            } else if (planoAcaoItem.statusPlanoAcao == 'nao_iniciado' && planoAcaoItem.checklistUnidadeProdutivaId) {
                //Caso de fluxo de aprovação
                const sqlChecklist = `SELECT CUP.status FROM checklist_unidade_produtivas CUP WHERE CUP.id = :checklistUnidadeProdutivaId`;
                const [dataChecklist] = await db.exec(sqlChecklist, [planoAcaoItem.checklistUnidadeProdutivaId]);
                if (dataChecklist.rows.length > 0) {
                    const checklist = dataChecklist.rows.item(0);

                    // se o checklist (aplicação) não estiver finalizado (ainda no fluxo de aprovação) não permite "aplicar" o PDA
                    if (checklist.status != 'finalizado') {
                        state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteAlterar', false);
                        state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteAlterarDescricao', false);
                    }
                }
            }

            //Caso especifico, Formulário possuí fluxo de aprovação, se o Status for "aprovado/reprovado", não permite editar mais o detalhamento da ação.
            if (
                planoAcaoItem.statusFlowChecklistUnidadeProdutiva &&
                (planoAcaoItem.statusFlowChecklistUnidadeProdutiva == 'aprovado' ||
                    planoAcaoItem.statusFlowChecklistUnidadeProdutiva == 'reprovado')
            ) {
                state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteAlterarDescricao', false);
            }

            //Permissoes do plano acao (dono)
            const [dataPlanoAcao] = await db.exec('SELECT * FROM plano_acoes WHERE id = :id', [
                planoAcaoItem.plano_acao_id,
            ]);
            const planoAcao = dataPlanoAcao.rows.item(0);

            //Tratamento apenas para Coletivo
            if (planoAcao.fl_coletivo == 1) {
                if (!planoAcao.can_update) {
                    state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteAlterar', false);
                    state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteAlterarDescricao', false);
                }
                if (!planoAcao.can_delete) {
                    state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteExcluir', false);
                }
                if (!planoAcao.can_reopen) {
                    state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteReabrir', false);
                }
                if (!planoAcao.can_history) {
                    state.set('planoAcaoItem.permissoesFormPlanoAcaoItem.permiteHistorico', false);
                }
            }
        }
    },
];

const salvarPlanoAcaoItem = [
    async ({ db, forms, path, props, state }) => {
        const data = forms.toJSON('planoAcaoItem.formPlanoAcaoItem');
        data.prazo = dateToSave(data.prazo);
        data.app_sync = 1;

        if (data.prioridade == 'atendida') {
            data.status = 'concluido';
        }

        if (data.status == 'concluido') {
            data.finished_at = moment().format('YYYY-MM-DD');
        }

        let statusAnterior;
        if (data.id) {
            const [resultStatus] = await db.exec('SELECT status FROM plano_acao_itens WHERE id = :id', [data.id]);
            if (resultStatus.rows.length > 0) {
                statusAnterior = resultStatus.rows.item(0).status;
            }
        }

        let observacaoInicial;
        if (data.observacao_inicial && data.observacao_inicial != '') {
            observacaoInicial = data.observacao_inicial;
        }
        delete data.observacao_inicial;

        const ret = await db.insertOrUpdate('plano_acao_itens', data);
        props.planoAcaoItemId = ret.id;
        props.planoAcaoId = data.plano_acao_id;

        if (data.id) {
            props.message = 'Ação atualizada com sucesso!';
            props.novoItemPlanoAcao = false;

            if (statusAnterior != data.status) {
                props.textoAlteracaoStatus = `Status alterado p/ ${
                    PLANO_ACAO_ITEM_STATUS.find((s) => s.value == data.status).label
                }`;
                const observacaoData = {
                    plano_acao_item_id: props.planoAcaoItemId,
                    user_id: state.get('auth.user.id'),
                    texto: props.textoAlteracaoStatus,
                    app_sync: 1,
                };

                await db.insertOrUpdate('plano_acao_item_historicos', observacaoData);
            }
        } else {
            props.message = 'Ação criada com sucesso!';
            props.novoItemPlanoAcao = true;

            if (observacaoInicial) {
                const observacaoData = {
                    plano_acao_item_id: props.planoAcaoItemId,
                    user_id: state.get('auth.user.id'),
                    texto: observacaoInicial,
                    app_sync: 1,
                };

                await db.insertOrUpdate('plano_acao_item_historicos', observacaoData);
            }
        }

        props.coletivo = false;
        if (data.fl_coletivo == 1 && !data.plano_acao_item_coletivo_id) {
            if (props.novoItemPlanoAcao) {
                data.id = props.planoAcaoItemId;
            }

            props.coletivo = true;
            props.itemPlanoAcaoColetivoPai = data;
        }
    },
    when(props`coletivo`, (coletivo) => !!coletivo),
    {
        true: [sincronizarItemPlanoAcaoColetivo],
        false: [],
    },
    when(props`syncAposSalvar`, (syncAposSalvar) => !!syncAposSalvar),
    {
        true: [...createSyncFlow(false, true, false, false, false, false, true, true)],
        false: [],
    },
    () => {
        ActionRoute.back();
    },
    toast({ text: props`message`, type: 'info' }),
];

const salvarObservacaoItem = [
    async ({ db, forms, path, props, state }) => {
        const formPlanoAcaoItem = forms.toJSON('planoAcaoItem.formPlanoAcaoItem');

        const data = forms.toJSON('planoAcaoItem.formObservacao');
        data.plano_acao_item_id = formPlanoAcaoItem.id;
        data.user_id = state.get('auth.user.id');
        data.app_sync = 1;

        const ret = await db.insertOrUpdate('plano_acao_item_historicos', data);
        props.id = ret.id;
        props.message = 'Acompanhamento criado com sucesso!';

        await db.insertOrUpdate('plano_acao_itens', {
            id: formPlanoAcaoItem.id,
            ultima_observacao: data.texto,
            ultima_observacao_data: moment().format('YYYY-MM-DD'),
        });

        await countPlanoAcaoItemHistoricos(data.plano_acao_item_id, state, db);
    },

    resetFormCustom(state`planoAcaoItem.formObservacao`),
    toast({ text: props`message`, type: 'info' }),
];

const excluirPlanoAcaoItem = [
    async (ctx) => {
        const { db, forms, props } = ctx;

        const result = await modal(
            {
                title: 'Você tem certeza?',
                content: 'Deseja realmente excluir a Ação?',
            },
            [
                { label: 'CONTINUAR', path: 'continuar' },
                { label: 'CANCELAR', path: 'cancelar' },
            ]
        )(ctx, true);

        if (result !== 'cancelar') {
            const form = forms.toJSON('planoAcaoItem.formPlanoAcaoItem');
            const [data] = await db.exec('SELECT * FROM plano_acao_itens WHERE id = :id', [form.id]);
            if (data.rows.length > 0) {
                const dataPlanoAcaoItem = data.rows.item(0);
                let sqls = [];
                let sqlsParams = [];
                if (dataPlanoAcaoItem.created_at) {
                    if (dataPlanoAcaoItem.fl_coletivo == 1 && !dataPlanoAcaoItem.plano_acao_item_coletivo_id) {
                        sqls.push(
                            'UPDATE plano_acao_itens SET deleted_at = :deleted_at, app_sync = 1 WHERE plano_acao_item_coletivo_id = :id'
                        );
                    }

                    sqls.push('UPDATE plano_acao_itens SET deleted_at = :deleted_at, app_sync = 1 WHERE id = :id');
                    sqlsParams.push(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
                    sqlsParams.push(dataPlanoAcaoItem.id);

                    props.syncAposSalvar = true;
                } else {
                    if (dataPlanoAcaoItem.fl_coletivo == 1 && !dataPlanoAcaoItem.plano_acao_item_coletivo_id) {
                        sqls = sqls.concat([
                            `DELETE FROM plano_acao_item_historicos
                                WHERE plano_acao_item_id IN (SELECT id FROM plano_acao_itens WHERE plano_acao_item_coletivo_id = :plano_acao_id)`,
                            `DELETE FROM plano_acao_itens WHERE plano_acao_item_coletivo_id = :id`,
                        ]);
                    }
                    sqls = sqls.concat([
                        'DELETE FROM plano_acao_item_historicos WHERE plano_acao_item_id =:plano_acao_item_id',
                        'DELETE FROM plano_acao_itens WHERE id = :id',
                    ]);
                    sqlsParams.push(dataPlanoAcaoItem.id);
                }

                await Promise.all(sqls.map(async (sql) => await db.exec(sql, sqlsParams)));
                props.planoAcaoItemExcluido = true;
            }
        }
    },
    when(props`planoAcaoItemExcluido`, (planoAcaoItemExcluido) => !!planoAcaoItemExcluido),
    {
        true: [
            () => {
                ActionRoute.back();
            },
            toast({ text: 'Ação excluída com sucesso', type: 'info' }),
        ],
        false: [],
    },
];

const reabrirPlanoAcaoItem = [
    async ({ db, forms, state, props }) => {
        const form = forms.toJSON('planoAcaoItem.formPlanoAcaoItem');
        const [data] = await db.exec('SELECT * FROM plano_acao_itens WHERE id = :id', [form.id]);

        if (data.rows.length > 0) {
            const dataPlanoAcaoItem = data.rows.item(0);
            dataPlanoAcaoItem.status = 'em_andamento';
            dataPlanoAcaoItem.app_sync = 1;
            dataPlanoAcaoItem.finished_at = null;

            const ret = await db.insertOrUpdate('plano_acao_itens', dataPlanoAcaoItem);

            props.message = 'Ação reaberta com sucesso!';
            props.planoAcaoItemId = ret.id;
            props.novoItemPlanoAcao = false;
            props.textoAlteracaoStatus = `Status alterado p/ ${
                PLANO_ACAO_ITEM_STATUS.find((s) => s.value == dataPlanoAcaoItem.status).label
            }`;

            const observacaoData = {
                plano_acao_item_id: props.planoAcaoItemId,
                user_id: state.get('auth.user.id'),
                texto: props.textoAlteracaoStatus,
                app_sync: 1,
            };
            await db.insertOrUpdate('plano_acao_item_historicos', observacaoData);

            props.coletivo = false;
            if (dataPlanoAcaoItem.fl_coletivo == 1 && !dataPlanoAcaoItem.plano_acao_item_coletivo_id) {
                props.coletivo = true;
                props.itemPlanoAcaoColetivoPai = dataPlanoAcaoItem;
            }
        }
    },
    when(props`coletivo`, (coletivo) => !!coletivo),
    {
        true: [sincronizarItemPlanoAcaoColetivo],
        false: [],
    },
    resetFormPlanoAcaoItem,
    fetchPlanoAcaoItem,
    toast({ text: props`message`, type: 'info' }),
];

export default Module({
    state: {
        countPlanoAcaoItemHistoricos: 0,
        permissoesFormPlanoAcaoItem: createPermissoesFormPlanoAcaoItem(),

        formPlanoAcaoItem: {
            id: {
                value: null,
            },
            plano_acao_id: {
                value: null,
            },
            checklist_pergunta_id: {
                value: null,
            },
            checklist_snapshot_resposta_id: {
                value: null,
            },
            fl_coletivo: {
                value: null,
            },
            plano_acao_item_coletivo_id: {
                value: null,
            },
            descricao: {
                value: '',
                validationRules: ['isRequired'],
            },
            status: {
                value: '',
                validationRules: ['isRequired'],
            },
            prioridade: {
                value: '',
                validationRules: ['isRequired'],
            },
            prazo: {
                value: '',
                validationRules: ['isDate'],
            },
            observacao_inicial: {
                value: '',
            },
        },
        formObservacao: {
            texto: {
                value: '',
                validationRules: [],
            },
        },
    },
    signals: {
        fetchPlanoAcaoItem,
        iniciarCadastroPlanoAcaoItem,
        salvarPlanoAcaoItem: [
            when(
                state`planoAcaoItem.formPlanoAcaoItem`,
                (formItem) =>
                    formItem.id.value && formItem.fl_coletivo.value === 1 && !formItem.plano_acao_item_coletivo_id.value
            ),
            {
                true: [
                    modal(
                        {
                            title: 'Aviso',
                            content:
                                'Ao salvar a ação coletiva, os dados informados nos campos descrição, status, prioridade e prazo irão sobrepor as ações individuais de todas as UPAs.',
                        },
                        [
                            { label: 'SIM', path: 'continue' },
                            { label: 'CANCELAR', path: 'cancel' },
                        ]
                    ),
                    {
                        continue: [salvarPlanoAcaoItem],
                        cancel: [],
                    },
                ],
                false: [salvarPlanoAcaoItem],
            },
        ],
        reabrirPlanoAcaoItem,
        excluirPlanoAcaoItem,
        salvarObservacaoItem,
        resetPlanoAcaoItem: [resetFormPlanoAcaoItem],
    },
});

async function countPlanoAcaoItemHistoricos(planoAcaoItemId, state, db) {
    const [
        count,
    ] = await db.exec(
        'SELECT COUNT(1) as count FROM plano_acao_item_historicos WHERE plano_acao_item_id = :id AND deleted_at IS NULL',
        [planoAcaoItemId]
    );
    if (count.rows.length > 0) {
        state.set('planoAcaoItem.countPlanoAcaoItemHistoricos', count.rows.item(0).count);
    }
}

function createPermissoesFormPlanoAcaoItem(
    permiteAlterar = false,
    permiteExcluir = false,
    permiteReabrir = false,
    somenteDetalhar = false,
    permiteAlterarDescricao = false,
    permiteHistorico = true
) {
    return {
        permiteAlterar,
        permiteHistorico,
        permiteExcluir,
        permiteReabrir,
        somenteDetalhar,
        permiteAlterarDescricao,
    };
}

function dateToSave(date) {
    if (!date) {
        return date;
    }
    const arr = date.split('/');
    if (arr.length !== 3) {
        return date;
    }
    return `${arr[2]}-${arr[1]}-${arr[0]}`;
}

function dateToDisplay(date) {
    if (!date) {
        return date;
    }
    const arr = date.split('-');
    if (arr.length !== 3) {
        return date;
    }
    return `${arr[2]}/${arr[1]}/${arr[0]}`;
}
