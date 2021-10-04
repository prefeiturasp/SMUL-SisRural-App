import { equals, set, when } from 'cerebral/operators';
import { props, state } from 'cerebral/tags';

import { ActionRoute } from '../components';
import { Module } from 'cerebral';
import { createSyncFlow } from './DBModule';
import { modal } from './addons';
import moment from 'moment';
import resetFormCustom from './form/resetFormCustom';
import { setFormData } from '../utils/CerebralUtil';
import { syncRespostasChecklistComItemPDA } from './ChecklistModule';
import { toast } from './ToastModule';

const syncFlow = createSyncFlow(false, false, false, false, false, false, true, true);

export const PLANO_ACAO_STATUS = [
    { value: 'rascunho', label: 'Rascunho', icon: null },
    { value: 'aguardando_aprovacao', label: 'Aguardando aprovação', icon: null },
    { value: 'nao_iniciado', label: 'Não iniciado', icon: 'naoIniciado' },
    { value: 'em_andamento', label: 'Em andamento', icon: 'emAndamento' },
    { value: 'concluido', label: 'Concluído', icon: 'concluido' },
    { value: 'cancelado', label: 'Cancelado', icon: 'cancelado' },
];

export const PLANO_ACAO_DETALHAMENTO_STATUS = [
    { value: 'rascunho', label: 'Rascunho', icon: null },
    { value: 'nao_iniciado', label: 'Prosseguir', icon: 'naoIniciado' },
];

const SELECT_VALIDA_CHECKLIST = `
      FROM checklist_unidade_produtivas cup
INNER JOIN checklists c ON c.id = cup.checklist_id
INNER JOIN checklist_categorias cc ON cc.checklist_id = c.id
INNER JOIN checklist_perguntas cp ON cp.checklist_categoria_id = cc.id
INNER JOIN perguntas p ON p.id = cp.pergunta_id
 LEFT JOIN checklist_snapshot_respostas csr ON csr.checklist_unidade_produtiva_id = cup.id AND csr.pergunta_id = p.id AND csr.deleted_at IS NULL
 LEFT JOIN unidade_produtiva_respostas upr ON upr.unidade_produtiva_id = cup.unidade_produtiva_id AND upr.pergunta_id = p.id AND csr.deleted_at IS NULL
WHERE cup.id = :id
  AND c.plano_acao IN ('opcional','obrigatorio')   
  AND cc.deleted_at IS NULL
  AND cp.fl_plano_acao = 1
  AND cp.deleted_at IS NULL
  AND NOT EXISTS (
     SELECT status AS plano_acoes_status
    FROM plano_acoes pa
   WHERE pa.checklist_unidade_produtiva_id = cup.id
     AND pa.status <> 'cancelado'
     AND pa.deleted_at IS NULL
  )
`;

const QUERY_VALIDA_CHECKLIST_GERAR_PDA = `
SELECT COUNT(1) AS count ${SELECT_VALIDA_CHECKLIST}
`;

const QUERY_DADOS_CHECKLIST_GERAR_PDA = `
SELECT cp.id AS checklist_pergunta_id,
       p.plano_acao_default AS descricao,
       csr.id AS checklist_snapshot_resposta_id,
       cp.plano_acao_prioridade AS prioridade,
       (SELECT r.cor
          FROM respostas r
         WHERE r.id = IFNULL(csr.resposta_id, upr.resposta_id)) AS resposta_cor
${SELECT_VALIDA_CHECKLIST}
`;

async function countPlanoAcaoHistoricos(planoAcaoId, state, db) {
    const [
        count,
    ] = await db.exec(
        'SELECT COUNT(1) as count FROM plano_acao_historicos WHERE plano_acao_id = :id AND deleted_at IS NULL',
        [planoAcaoId]
    );

    if (count.rows.length > 0) {
        state.set('planoAcao.countPlanoAcaoHistoricos', count.rows.item(0).count);
    }
}

const resetFormPlanoAcao = [
    resetFormCustom(state`planoAcao.formBasico`),
    resetFormCustom(state`planoAcao.formCompleto`),
    resetFormCustom(state`planoAcao.formObservacao`),
    set(state`planoAcao.countPlanoAcaoHistoricos`, 0),
    set(state`planoAcao.permissoesFormPlanoAcao`, createPermissoesFormPlanoAcao()),
];

const validaInicioCadastroPDA = [
    async ({ props, db }) => {
        const result = {
            unidadeProdutivaId: null,
            produtorId: null,
            checklistUnidadeProdutivaId: null,
            flColetivo: 0,
            nomePlanoAcao: '',
            status: 'nao_iniciado',
            ...props,
        };

        if (props.coletivo) {
            result.flColetivo = 1;
        } else if (props.checklistUnidadeProdutivaId) {
            const [otherPDAData] = await db.exec(
                // TODO: VER COM RAFA SE PODE CANCELADO
                `SELECT COUNT(1) count FROM plano_acoes WHERE checklist_unidade_produtiva_id = :id AND status <> 'cancelado' AND deleted_at IS NULL`,
                [props.checklistUnidadeProdutivaId]
            );

            if (otherPDAData.rows.length > 0 && otherPDAData.rows.item(0).count > 0) {
                result.message =
                    'Já existe um plano de ação a partir deste formulário iniciado para a unidade produtiva/produtor selecionado. Verifique no perfil do produtor/a.';
                result.erro = true;
                result.redirect = '/buscaPlanoAcao/individual';
            } else {
                const [data] = await db.exec(QUERY_VALIDA_CHECKLIST_GERAR_PDA, [props.checklistUnidadeProdutivaId]);
                let questoesChecklistPDA = 0;
                if (data.rows.length > 0) {
                    const queryResult = data.rows.item(0);
                    questoesChecklistPDA = queryResult.count;
                }
                if (questoesChecklistPDA == 0) {
                    result.message = 'Não é possível criar um Plano de Ação para o Checklist.';
                    result.erro = true;
                }

                const [checklistData] = await db.exec(
                    `
                    SELECT C.nome
                    FROM checklists C, checklist_unidade_produtivas CUP 
                    WHERE CUP.id = :checklistUnidadeProdutivaId AND C.id = CUP.checklist_id`,
                    [props.checklistUnidadeProdutivaId]
                );

                result.status = 'rascunho';
                if (checklistData.rows.length > 0) {
                    const checklist = checklistData.rows.item(0);
                    result.nomePlanoAcao = checklist.nome;
                }
            }
        } else {
            const [data] = await db.exec(
                `SELECT count(1) as quantidade FROM plano_acoes 
                  WHERE unidade_produtiva_id = :unidade_produtiva_id 
                    AND produtor_id = :produtor_id 
                    AND status IN ('em_andamento', 'nao_iniciado')
                    AND plano_acao_coletivo_id IS NULL
                    AND checklist_unidade_produtiva_id IS NULL
                    AND deleted_at IS NULL`,
                [props.unidadeProdutivaId, props.produtorId]
            );
            let quantidade = 0;
            if (data.rows.length > 0) {
                const queryResult = data.rows.item(0);
                quantidade = queryResult.quantidade;
            }
            if (quantidade > 0) {
                result.message =
                    'Já existe um plano de ação não iniciado ou em andamento para esta unidade produtiva / produtor.';
                result.erro = true;
                result.redirect = '/buscaPlanoAcao/individual';
            }
        }
        return result;
    },
];

const fetchPlanoAcao = [
    syncFlow,
    resetFormPlanoAcao,
    async ({ db, props, state }) => {
        const [data] = await db.exec('SELECT * FROM plano_acoes WHERE id = :id', [props.planoAcaoId]);

        if (data.rows.length > 0) {
            const planoAcao = data.rows.item(0);
            planoAcao.prazo = dateToDisplay(planoAcao.prazo);

            await countPlanoAcaoHistoricos(planoAcao.id, state, db);

            setFormData('planoAcao.formBasico', planoAcao, state);
            setFormData('planoAcao.formCompleto', planoAcao, state);

            if (
                ['rascunho', 'nao_iniciado', 'em_andamento'].includes(planoAcao.status) &&
                (planoAcao.fl_coletivo == 0 || !planoAcao.plano_acao_coletivo_id)
            ) {
                // ver abaixo pois o indicador de permiteAlterar pode ser modificado dependendo do checklist quando for o caso
                state.set('planoAcao.permissoesFormPlanoAcao.permiteAlterar', true);
            } else if (
                ['concluido', 'cancelado'].includes(planoAcao.status) &&
                (planoAcao.fl_coletivo == 0 || !planoAcao.plano_acao_coletivo_id)
            ) {
                let quantidade = 0;

                let sqlCount;
                let sqlCountParams;

                if (planoAcao.fl_coletivo == 0) {
                    // Plano individual SEM checklist só pode ser reaberto se não tiver um em andamento para o mesmo produtor/unidade
                    // Plano individual COM checklist só pode ser reaberto se não tiver um em andamento para o mesmo produtor/unidade/checklist

                    sqlCount = `SELECT count(1) as quantidade FROM plano_acoes
                    WHERE status IN ('em_andamento', 'nao_iniciado')
                    AND plano_acao_coletivo_id IS NULL
                    AND deleted_at IS NULL
                    AND unidade_produtiva_id = :unidade_produtiva_id
                    AND produtor_id = :produtor_id `;

                    sqlCountParams = [planoAcao.unidade_produtiva_id, planoAcao.produtor_id];

                    if (!planoAcao.checklist_unidade_produtiva_id) {
                        sqlCount += `AND checklist_unidade_produtiva_id IS NULL`;
                    } else {
                        sqlCount += `AND checklist_unidade_produtiva_id = :checklist_unidade_produtiva_id`;
                        sqlCountParams.push(planoAcao.checklist_unidade_produtiva_id);
                    }
                }

                if (sqlCount) {
                    const [dataQuantidade] = await db.exec(sqlCount, sqlCountParams);
                    if (dataQuantidade.rows.length > 0) {
                        const queryResult = dataQuantidade.rows.item(0);
                        quantidade = queryResult.quantidade;
                    }
                }

                state.set('planoAcao.permissoesFormPlanoAcao.permiteReabrir', quantidade == 0);
            }

            if (planoAcao.checklist_unidade_produtiva_id) {
                if (planoAcao.status == 'rascunho') {
                    state.set('planoAcao.permissoesFormPlanoAcao.somenteDetalhar', true);
                    props.syncPDAComChecklist = true;
                    props.checklistUnidadeProdutivaId = planoAcao.checklist_unidade_produtiva_id;
                } else if (planoAcao.status == 'nao_iniciado') {
                    const sqlChecklist = `SELECT CUP.status FROM checklist_unidade_produtivas CUP WHERE CUP.id = :checklistUnidadeProdutivaId`;
                    const [dataChecklist] = await db.exec(sqlChecklist, [planoAcao.checklist_unidade_produtiva_id]);
                    if (dataChecklist.rows.length > 0) {
                        const checklist = dataChecklist.rows.item(0);

                        // se o checklist (aplicação) não estiver finalizado (ainda no fluxo de aprovação) não permite "aplicar" o PDA
                        if (checklist.status != 'finalizado') {
                            state.set('planoAcao.permissoesFormPlanoAcao.permiteAlterar', false);
                        }
                    }
                }
            }

            if (!planoAcao.plano_acao_coletivo_id) {
                state.set('planoAcao.permissoesFormPlanoAcao.permiteCompartilhar', true);
            }

            /**
             * Dados vem do "Backend", após passar pelos métodos anteriores, se o backend retorna FALSE, o FALSE é mandatório, se o backend retorna TRUE, ai o que vale é as regras anteriores
             */
            if (!planoAcao.can_update) {
                state.set('planoAcao.permissoesFormPlanoAcao.permiteAlterar', false);
            }

            state.set('planoAcao.permissoesFormPlanoAcao.permiteReabrir', planoAcao.can_reopen);
            state.set('planoAcao.permissoesFormPlanoAcao.permiteExcluir', planoAcao.can_delete);
            state.set('planoAcao.permissoesFormPlanoAcao.permiteHistorico', planoAcao.can_history);
        }
    },
    when(props`syncPDAComChecklist`, (s) => !!s),
    {
        true: [syncRespostasChecklistComItemPDA],
        false: [],
    },
];

const criarItensAcoesChecklist = [
    async ({ props, db }) => {
        const { criarAcoesChecklist } = props;
        await Promise.all(
            criarAcoesChecklist.map((acao) => {
                const respostaCor = acao.resposta_cor;
                delete acao.resposta_cor;

                acao.plano_acao_id = props.planoAcaoId;
                acao.prazo = props.prazo;
                acao.status = 'nao_iniciado';
                acao.app_sync = 1;

                if (respostaCor === 'verde' || respostaCor === 'cinza') {
                    acao.prioridade = 'atendida';
                    acao.status = 'concluido';
                }

                return db.insertOrUpdate('plano_acao_itens', acao);
            })
        );
    },
];

// Sincroniza nos planos de ação filhos as informações atualizadas - não precisa verificar se é insert ou update, pois no insert do plano de ação pai nunca haverá filhos
const sincronizarPlanoAcaoColetivo = [
    async ({ props, state, db }) => {
        const [data] = await db.exec('SELECT * FROM plano_acoes WHERE plano_acao_coletivo_id = :id', [
            props.planoAcaoId,
        ]);
        if (data.rows.length > 0) {
            await Promise.all(
                data.rows.raw().map(async (planoFilho) => {
                    planoFilho.app_sync = 1;
                    planoFilho.nome = props.planoAcaoColetivoPai.nome;
                    planoFilho.prazo = props.planoAcaoColetivoPai.prazo;
                    planoFilho.status = props.planoAcaoColetivoPai.status;

                    await db.insertOrUpdate('plano_acoes', planoFilho);

                    if (props.textoAlteracaoStatus) {
                        const observacaoData = {
                            plano_acao_id: planoFilho.id,
                            user_id: state.get('auth.user.id'),
                            texto: props.textoAlteracaoStatus,
                            app_sync: 1,
                        };

                        await db.insertOrUpdate('plano_acao_historicos', observacaoData);
                    }
                })
            );
        }
    },
];

const salvarPlanoAcaoBasico = [
    async ({ db, forms, path, props }) => {
        const data = forms.toJSON('planoAcao.formBasico');
        data.prazo = dateToSave(data.prazo);
        data.can_view = true;
        data.can_update = true;
        data.can_history = true;
        data.can_delete = false;
        data.can_reopen = false;
        data.app_sync = 1;

        // Precisa pesquisar antes de realizar o INSERT do PDA, quais serão as ações de checklist que serão criadas,
        //  pois a query faz validações que não são atendidas se o PDA for criado
        let criarAcoesChecklist;
        if (data.checklist_unidade_produtiva_id) {
            const [resultDadosChecklist] = await db.exec(QUERY_DADOS_CHECKLIST_GERAR_PDA, [
                data.checklist_unidade_produtiva_id,
            ]);
            if (resultDadosChecklist.rows.length > 0) {
                criarAcoesChecklist = resultDadosChecklist.rows.raw();
            }
        }

        const ret = await db.insertOrUpdate('plano_acoes', data);
        props.planoAcaoId = ret.id;
        props.message = 'Plano de Ação criado com sucesso!';
        props.criarAcoesChecklist = criarAcoesChecklist;
        props.prazo = data.prazo;
    },
    when(props`criarAcoesChecklist`, (criarAcoesChecklist) => !!criarAcoesChecklist),
    {
        true: [criarItensAcoesChecklist],
        false: [],
    },
    ...createSyncFlow(false, false, false, false, false, false, true, true),
    async ({ props, db }) => {
        const [existPDA] = await db.exec(
            `SELECT COUNT(1) count FROM plano_acoes WHERE id = :id AND deleted_at IS NULL`,
            [props.planoAcaoId]
        );

        if (existPDA.rows.length > 0 && existPDA.rows.item(0).count > 0) {
            ActionRoute.replace(`/planoAcao/${props.planoAcaoId}`);
        } else {
            props.message =
                'Já foi criado um plano de ação para a unidade produtiva/produtor selecionado, o cadastro do aplicativo foi inválidado.';
            ActionRoute.replace(`/home`);
        }
    },
    toast({ text: props`message`, type: 'info' }),
];

const salvarPlanoAcaoCompleto = [
    async (ctx) => {
        const { db, forms, props, state, path } = ctx;
        const data = forms.toJSON('planoAcao.formCompleto');

        let statusAnterior;
        let nomeAnterior;
        let prazoAnterior;

        const [resultStatus] = await db.exec('SELECT status,nome,prazo FROM plano_acoes WHERE id = :id', [data.id]);
        if (resultStatus.rows.length > 0) {
            statusAnterior = resultStatus.rows.item(0).status;
            nomeAnterior = resultStatus.rows.item(0).nome;
            prazoAnterior = resultStatus.rows.item(0).prazo;
        }

        if (data.checklist_unidade_produtiva_id) {
            const sqlChecklist = `
            SELECT C.fl_fluxo_aprovacao, C.plano_acao, CUP.status AS CUP_status
            FROM checklists C, checklist_unidade_produtivas CUP 
            WHERE CUP.id = :checklistUnidadeProdutivaId AND C.id = CUP.checklist_id`;

            const [dataChecklist] = await db.exec(sqlChecklist, [data.checklist_unidade_produtiva_id]);
            if (dataChecklist.rows.length > 0) {
                const checklist = dataChecklist.rows.item(0);

                // se o checklist (aplicação) não estiver finalizado (ainda no fluxo de aprovação) não permite "aplicar" o PDA
                if (data.status == 'nao_iniciado' && statusAnterior == 'rascunho') {
                    if (!['aguardando_pda', 'finalizado'].includes(checklist.CUP_status)) {
                        props.message =
                            'Não é possível iniciar o plano de ação com o status atual do formulário aplicado.';
                        return path.erro();
                    }

                    if (checklist.fl_fluxo_aprovacao == 1 && checklist.plano_acao == 'obrigatorio') {
                        const result = await modal(
                            {
                                title: 'Você tem certeza?',
                                content: 'Este Plano de Ação será enviado para análise. Deseja enviar?',
                            },
                            [
                                { label: 'CONTINUAR', path: 'continuar' },
                                { label: 'CANCELAR', path: 'cancelar' },
                            ]
                        )(ctx, true);

                        if (result == 'cancelar') {
                            return path.cancelar();
                        }
                    }
                }
            }
        }

        data.prazo = dateToSave(data.prazo);
        data.app_sync = 1;

        const ret = await db.insertOrUpdate('plano_acoes', data);
        props.planoAcaoId = ret.id;
        props.message = 'Plano de Ação atualizado com sucesso!';

        if (statusAnterior != data.status) {
            props.textoAlteracaoStatus = `Status alterado p/ ${
                PLANO_ACAO_STATUS.find((s) => s.value == data.status).label
            }`;

            const observacaoData = {
                plano_acao_id: props.planoAcaoId,
                user_id: state.get('auth.user.id'),
                texto: props.textoAlteracaoStatus,
                app_sync: 1,
            };

            await db.insertOrUpdate('plano_acao_historicos', observacaoData);
        }

        if (nomeAnterior != data.nome) {
            let message = `Nome alterado de "${nomeAnterior}" p/ "${data.nome}"`;

            await db.insertOrUpdate('plano_acao_historicos', {
                plano_acao_id: props.planoAcaoId,
                user_id: state.get('auth.user.id'),
                texto: message,
                app_sync: 1,
            });
        }

        if (prazoAnterior != data.prazo && prazoAnterior && data.prazo) {
            let message = `Prazo alterado de "${dateToDisplay(prazoAnterior)}" p/ "${dateToDisplay(data.prazo)}"`;

            await db.insertOrUpdate('plano_acao_historicos', {
                plano_acao_id: props.planoAcaoId,
                user_id: state.get('auth.user.id'),
                texto: message,
                app_sync: 1,
            });
        }

        if (data.fl_coletivo == 1 && !data.plano_acao_coletivo_id) {
            props.coletivo = true;
            props.planoAcaoColetivoPai = data;
        } else {
            props.coletivo = false;
        }

        return path.continuar();
    },
    {
        erro: [
            modal(
                {
                    title: 'Aviso',
                    content: props`message`,
                },
                [{ label: 'ENTENDI', path: 'continue' }]
            ),
            {
                continue: [],
            },
        ],
        continuar: [
            when(props`coletivo`, (coletivo) => !!coletivo),
            {
                true: [sincronizarPlanoAcaoColetivo],
                false: [],
            },
            when(props`syncAposSalvar`, (syncAposSalvar) => !!syncAposSalvar),
            {
                true: [...createSyncFlow(false, false, false, false, false, false, true, true)],
                false: [],
            },
            when(props`redirectRouteAposSalvar`, (redirectRouteAposSalvar) => !!redirectRouteAposSalvar),
            {
                true: [
                    resetFormPlanoAcao,
                    ({ props }) => {
                        ActionRoute.go(props.redirectRouteAposSalvar, props.routeStateAposSalvar);
                    },
                ],
                false: [fetchPlanoAcao],
            },
            when(props`mostrarConfirmacao`, (v) => !!v),
            { true: [toast({ text: props`message`, type: 'info' })], false: [] },
        ],
        cancelar: [],
    },
];

const salvarPlanoAcao = [
    equals(props`tipoFormulario`),
    {
        basico: [salvarPlanoAcaoBasico],
        completo: [salvarPlanoAcaoCompleto],
        otherwise: [
            () => {
                console.error('tipo de formulário não informado');
            },
        ],
    },
];

const excluirPlanoAcao = [
    async (ctx) => {
        const { db, forms, props } = ctx;

        const form = forms.toJSON('planoAcao.formCompleto');

        const result = await modal(
            {
                title: 'Você tem certeza?',
                content:
                    form.fl_coletivo == 1 && form.plano_acao_coletivo_id
                        ? 'Deseja realmente remover a unidade produtiva do plano de ação coletivo?'
                        : 'Deseja realmente excluir o Plano de Ação?',
            },
            [
                { label: 'CONTINUAR', path: 'continuar' },
                { label: 'CANCELAR', path: 'cancelar' },
            ]
        )(ctx, true);

        if (result !== 'cancelar') {
            const [data] = await db.exec('SELECT * FROM plano_acoes WHERE id = :id', [form.id]);

            if (data.rows.length > 0) {
                const dataPlanoAcao = data.rows.item(0);

                let sqls = [];
                let sqlsParams = [];
                if (dataPlanoAcao.created_at) {
                    if (dataPlanoAcao.fl_coletivo == 1 && !dataPlanoAcao.plano_acao_coletivo_id) {
                        sqls.push(
                            'UPDATE plano_acoes SET deleted_at = :deleted_at, app_sync = 1 WHERE plano_acao_coletivo_id = :plano_acao_id'
                        );
                    }

                    sqls.push(
                        'UPDATE plano_acoes SET deleted_at = :deleted_at, app_sync = 1 WHERE id = :plano_acao_id'
                    );

                    sqlsParams.push(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
                    sqlsParams.push(dataPlanoAcao.id);
                    props.syncAposSalvar = true;
                } else {
                    if (dataPlanoAcao.fl_coletivo == 1 && !dataPlanoAcao.plano_acao_coletivo_id) {
                        sqls = sqls.concat([
                            `DELETE FROM plano_acao_item_historicos 
                                WHERE plano_acao_item_id IN (SELECT pai.id FROM plano_acao_itens pai, plano_acoes pa WHERE pai.plano_acao_id = pa.id AND pa.plano_acao_coletivo_id = :plano_acao_id)`,
                            `DELETE FROM plano_acao_itens 
                                WHERE plano_acao_id IN (SELECT id FROM plano_acoes WHERE plano_acao_coletivo_id = :plano_acao_id)`,
                            'DELETE FROM plano_acao_historicos WHERE plano_acao_id IN (SELECT id FROM plano_acoes WHERE plano_acao_coletivo_id = :plano_acao_id)',
                            'DELETE FROM plano_acoes WHERE plano_acao_coletivo_id = :plano_acao_id',
                        ]);
                    }

                    sqls = sqls.concat([
                        'DELETE FROM plano_acao_item_historicos WHERE plano_acao_item_id IN (SELECT id FROM plano_acao_itens WHERE plano_acao_id = :plano_acao_id)',
                        'DELETE FROM plano_acao_itens WHERE plano_acao_id = :plano_acao_id',
                        'DELETE FROM plano_acao_historicos WHERE plano_acao_id = :plano_acao_id',
                        'DELETE FROM plano_acoes WHERE id = :plano_acao_id',
                    ]);

                    sqlsParams.push(dataPlanoAcao.id);
                }

                await Promise.all(sqls.map(async (sql) => await db.exec(sql, sqlsParams)));

                if (dataPlanoAcao.fl_coletivo == 1 && dataPlanoAcao.plano_acao_coletivo_id) {
                    props.message = 'Unidade Produtiva removida do Plano de Ação';
                } else {
                    props.message = 'Plano de Ação excluído com sucesso';
                }
                props.planoAcaoExcluido = true;
            }
        }
    },
    when(props`planoAcaoExcluido`, (planoAcaoExcluido) => !!planoAcaoExcluido),
    {
        true: [
            () => {
                ActionRoute.back();
            },
            //Back já vai fazer o sync dos dados, se disparar aqui, os dois vão rodar concorrentemente e vai dar uma mensagem de aviso na tela que "Dados não podem ser atualizados"
            // when(props`syncAposSalvar`, syncAposSalvar => !!syncAposSalvar),
            // {
            //     true: [...createSyncFlow(false, true, false, false, false, false)],
            //     false: [],
            // },
            toast({ text: props`message`, type: 'info' }),
        ],
        false: [],
    },
];

const reabrirPlanoAcao = [
    async ({ db, forms, props, state }) => {
        const form = forms.toJSON('planoAcao.formCompleto');
        const [data] = await db.exec('SELECT * FROM plano_acoes WHERE id = :id', [form.id]);

        if (data.rows.length > 0) {
            const dataPlanoAcao = data.rows.item(0);
            dataPlanoAcao.status = 'em_andamento';
            dataPlanoAcao.app_sync = 1;

            const ret = await db.insertOrUpdate('plano_acoes', dataPlanoAcao);

            props.planoAcaoId = ret.id;
            props.message = 'Plano de Ação atualizado com sucesso!';
            props.textoAlteracaoStatus = `Status alterado p/ ${
                PLANO_ACAO_STATUS.find((s) => s.value == dataPlanoAcao.status).label
            }`;

            const observacaoData = {
                plano_acao_id: props.planoAcaoId,
                user_id: state.get('auth.user.id'),
                texto: props.textoAlteracaoStatus,
                app_sync: 1,
            };

            await db.insertOrUpdate('plano_acao_historicos', observacaoData);

            if (dataPlanoAcao.fl_coletivo == 1 && !dataPlanoAcao.plano_acao_coletivo_id) {
                props.coletivo = true;
                props.planoAcaoColetivoPai = dataPlanoAcao;
            }
        }
    },
    when(props`coletivo`, (coletivo) => !!coletivo),
    {
        true: [sincronizarPlanoAcaoColetivo],
        false: [],
    },
    ...createSyncFlow(false, false, false, false, false, false, true, true),
    resetFormPlanoAcao,
    fetchPlanoAcao,
    { true: [toast({ text: props`message`, type: 'info' })], false: [] },
];

export default Module({
    state: {
        countPlanoAcaoHistoricos: 0,

        formBasico: {
            id: {
                value: null,
            },
            user_id: {
                value: null,
            },
            unidade_produtiva_id: {
                value: null,
            },
            produtor_id: {
                value: null,
            },
            checklist_unidade_produtiva_id: {
                value: null,
            },
            fl_coletivo: {
                value: null,
            },
            plano_acao_coletivo_id: {
                value: null,
            },
            nome: {
                value: '',
                validationRules: ['isRequired'],
            },
            prazo: {
                value: '',
                validationRules: ['isDate'],
            },
            status: {
                value: '',
                validationRules: ['isRequired'],
            },
        },

        formCompleto: {
            id: {
                value: null,
            },
            user_id: {
                value: null,
            },
            unidade_produtiva_id: {
                value: null,
            },
            produtor_id: {
                value: null,
            },
            checklist_unidade_produtiva_id: {
                value: null,
            },
            fl_coletivo: {
                value: null,
            },
            plano_acao_coletivo_id: {
                value: null,
            },
            nome: {
                value: '',
                validationRules: ['isRequired'],
            },
            prazo: {
                value: '',
                validationRules: ['isDate'],
            },
            status: {
                value: '',
                validationRules: ['isRequired'],
            },
        },

        permissoesFormPlanoAcao: createPermissoesFormPlanoAcao(),

        formObservacao: {
            texto: {
                value: '',
            },
        },
    },
    signals: {
        sync: [syncFlow],
        fetchPlanoAcao,
        salvarPlanoAcao,
        reabrirPlanoAcao,
        excluirPlanoAcao,

        iniciarCadastroPlanoAcao: [
            syncFlow,
            resetFormPlanoAcao,
            validaInicioCadastroPDA,
            when(props`erro`, (erro) => erro),
            {
                true: [
                    modal(
                        {
                            title: 'Aviso',
                            content: props`message`,
                        },
                        [{ label: 'ENTENDI', path: 'continue' }]
                    ),
                    {
                        continue: [
                            ({ props }) => {
                                if (props.redirect) {
                                    ActionRoute.replace(props.redirect, { produtorId: props.produtorId });
                                } else {
                                    ActionRoute.back();
                                }
                            },
                        ],
                    },
                ],
                false: [
                    set(state`planoAcao.permissoesFormPlanoAcao.permiteAlterar`, true),
                    set(state`planoAcao.formBasico.nome.value`, props`nomePlanoAcao`),
                    set(state`planoAcao.formBasico.status.value`, props`status`),
                    set(state`planoAcao.formBasico.unidade_produtiva_id.value`, props`unidadeProdutivaId`),
                    set(state`planoAcao.formBasico.produtor_id.value`, props`produtorId`),
                    set(state`planoAcao.formBasico.fl_coletivo.value`, props`flColetivo`),
                    set(
                        state`planoAcao.formBasico.checklist_unidade_produtiva_id.value`,
                        props`checklistUnidadeProdutivaId`
                    ),
                    set(state`planoAcao.formBasico.user_id.value`, state`auth.user.id`),
                ],
            },
        ],

        adicionarUnidadeProdutivaPlanoAcaoColetivo: [
            async ({ props, forms, db }) => {
                const form = forms.toJSON('planoAcao.formCompleto');

                props.redirectRouteAposSalvar = `/buscaProdutorRedirect/plano-acao-coletivo/${form.id}`;

                const [data] = await db.exec(
                    `SELECT produtor_id AS produtorId,
                            unidade_produtiva_id AS unidadeProdutivaId
                       FROM plano_acoes
                     WHERE plano_acao_coletivo_id = :id
                       AND deleted_at IS NULL`,
                    [form.id]
                );

                if (data.rows.length > 0) {
                    props.routeStateAposSalvar = { filtroProdutorUnidadeProdutiva: data.rows.raw() };
                }
            },
            salvarPlanoAcaoCompleto,
        ],

        inserirUnidadeProdutivaPlanoAcaoColetivo: [
            syncFlow,
            resetFormPlanoAcao,
            async ({ props, state, db }) => {
                const [data] = await db.exec('SELECT * FROM plano_acoes WHERE id = :id AND fl_coletivo = 1', [
                    props.planoAcaoId,
                ]);

                if (data.rows.length != 1) {
                    return;
                }
                const planoAcaoPai = data.rows.item(0);

                const [dataExists] = await db.exec(
                    `
                    SELECT COUNT(1) as count
                      FROM plano_acoes 
                     WHERE plano_acao_coletivo_id = :planoColetivoId 
                       AND unidade_produtiva_id = :unidadeProdutivaId
                       AND produtor_id = :produtorId
                       AND deleted_at IS NULL`,
                    [props.planoAcaoId, props.unidadeProdutivaId, props.produtorId]
                );

                if (dataExists.rows.length == 1 && dataExists.rows.item(0).count == 0) {
                    const planoFilho = { ...planoAcaoPai };
                    planoFilho.id = null;
                    planoFilho.plano_acao_coletivo_id = planoAcaoPai.id;
                    planoFilho.unidade_produtiva_id = props.unidadeProdutivaId;
                    planoFilho.produtor_id = props.produtorId;
                    planoFilho.user_id = state.get('auth.user.id');
                    planoFilho.created_at = null;
                    planoFilho.updated_at = null;
                    planoFilho.app_sync = 1;

                    const resultPlanoFilho = await db.insertOrUpdate('plano_acoes', planoFilho);

                    if (!resultPlanoFilho.id) {
                        return;
                    }

                    const [
                        acoesData,
                    ] = await db.exec(
                        'SELECT * FROM plano_acao_itens WHERE plano_acao_id = :plano_acao_id AND deleted_at is null',
                        [props.planoAcaoId]
                    );

                    if (acoesData.rows.length > 0) {
                        await Promise.all(
                            acoesData.rows.raw().map(async (acaoPai) => {
                                const acaoFilho = { ...acaoPai };
                                acaoFilho.id = null;
                                acaoFilho.plano_acao_item_coletivo_id = acaoPai.id;
                                acaoFilho.plano_acao_id = resultPlanoFilho.id;
                                acaoFilho.app_sync = 1;

                                await db.insertOrUpdate('plano_acao_itens', acaoFilho);
                            })
                        );
                    }
                }

                // Dá um replace no router para evitar adicionar mais de uma vez a unidade produtiva/produtor no plano coletivo
                ActionRoute.replace(`/planoAcao/${props.planoAcaoId}`);
            },
            //Essa ação não precisa, porque no momento do ActionRoute.replace, ele vai fazer essa chamada
            // fetchPlanoAcao,
        ],

        salvarObservacao: [
            async ({ db, forms, path, props, state }) => {
                const form = forms.toJSON('planoAcao.formCompleto');

                const data = forms.toJSON('planoAcao.formObservacao');
                data.plano_acao_id = form.id;
                data.user_id = state.get('auth.user.id');
                data.app_sync = 1;

                const ret = await db.insertOrUpdate('plano_acao_historicos', data);
                props.id = ret.id;
                props.message = 'Acompanhamento criado com sucesso!';

                await countPlanoAcaoHistoricos(data.plano_acao_id, state, db);
            },

            resetFormCustom(state`planoAcao.formObservacao`),
            toast({ text: props`message`, type: 'info' }),
        ],

        validaCriacaoPDACheckList: [
            async ({ db, props }) => {
                const [result] = await db.exec(QUERY_VALIDA_CHECKLIST_GERAR_PDA, [props.checklistUnidadeProdutivaId]);
                let countChecklistPDA = 0;
                if (result.rows.length > 0) {
                    countChecklistPDA = result.rows.item(0).count;
                }
                props.countChecklistPDA = countChecklistPDA;
            },
        ],

        resetPlanoAcao: [resetFormPlanoAcao],
    },
});

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

function createPermissoesFormPlanoAcao(
    permiteAlterar = false,
    permiteExcluir = false,
    permiteReabrir = false,
    permiteCompartilhar = false,
    somenteDetalhar = false,
    permiteHistorico = false
) {
    return { permiteAlterar, permiteExcluir, permiteReabrir, permiteCompartilhar, somenteDetalhar, permiteHistorico };
}
