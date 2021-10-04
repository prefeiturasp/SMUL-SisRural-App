import { APIResponse, post } from './services';
import ChecklistUnidadeProdutiva, {
    ChecklistUnidadeProdutivaStatus,
} from '../db/typeORM/ChecklistUnidadeProdutivaModel';
import { getConnection, getRepository } from 'typeorm/browser';
import { props, state } from 'cerebral/tags';
import { toast, toastErrorRequest } from './ToastModule';

import { ActionRoute } from '../components';
import { ChecklistPlanoAcao } from '../db/typeORM/ChecklistModel';
import ChecklistSnapshotRespostas from '../db/typeORM/ChecklistSnapshotResposta';
import DocumentPicker from 'react-native-document-picker';
import { ErrorRedirectHome } from '../controller/ErrorHandler';
import ImagePicker from 'react-native-image-picker';
import { Module } from 'cerebral';
import RNFS from 'react-native-fs';
import UnidadeProdutivaResposta from '../db/typeORM/UnidadeProdutivaRespostaModel';
import _ from 'lodash';
import { createSyncFlow } from '../modules/DBModule';
import { modal } from './addons';
import moment from 'moment';
import { offlineCheckFlow } from './OfflineModule';
import { requestPermissionsFlow } from '../pages/cadastroCadernoCampo/CadernoCampoModule';
import { when } from 'cerebral/operators';

const prepareCarregarResultado = ({ props: { checklistUnidadeProdutivaId } }) => {
    return { variables: { checklist_unidade_produtiva_id: checklistUnidadeProdutivaId } };
};

const syncFlow = createSyncFlow(false, false, false, false, false, false, true, true);

const verificaRespostasObrigatorias = async (ctx) => {
    const { props } = ctx;
    const checklistUnidadeProdutivaId = props.checklistUnidadeProdutivaId;

    const CUPModel = await getRepository(ChecklistUnidadeProdutiva)
        .createQueryBuilder('CUP')
        .leftJoinAndSelect('CUP.checklist', 'checklist')
        .leftJoinAndSelect('checklist.categorias', 'categorias')
        .leftJoinAndSelect('categorias.checklistPerguntas', 'checklistPerguntas')
        .where(
            `categorias.deleted_at is null and
            checklistPerguntas.deleted_at is null and
            CUP.id = :id`,
            { id: checklistUnidadeProdutivaId }
        )
        .getOne();

    if (CUPModel.status !== ChecklistUnidadeProdutivaStatus.rascunho) {
        throw new ErrorRedirectHome(
            'Não foi possível finalizar o formulário. O status dele já foi alterado por outra pessoa. Acesse o formulário novamente para ver os dados atualizados.'
        );
    }

    const todasPerguntas = _.flatMap(CUPModel.checklist.categorias, (v) => v.checklistPerguntas);
    const perguntasObrigatorias = todasPerguntas.filter((p) => p.fl_obrigatorio === 1);

    const respostasObrigatoriasIds = await getRepository(UnidadeProdutivaResposta)
        .createQueryBuilder('UPR')
        .select(
            `
            distinct pergunta_id
        `
        )
        .where(
            `
        unidade_produtiva_id = :uid and 
        deleted_at is null and 
         pergunta_id in (` +
                [-1, ...perguntasObrigatorias.map((v) => v.pergunta_id)] +
                `)
    `,
            { uid: CUPModel.unidade_produtiva_id }
        )
        .getRawMany();

    return { isFormFilled: respostasObrigatoriasIds.length >= perguntasObrigatorias.length, todasPerguntas };
};

export const syncRespostasChecklistComItemPDA = async (ctx) => {
    const { props, db } = ctx;

    const { checklistUnidadeProdutivaId } = props;

    const CUPModel = await getRepository(ChecklistUnidadeProdutiva)
        .createQueryBuilder('CUP')
        .leftJoinAndSelect('CUP.checklist', 'checklist')
        .leftJoinAndSelect('checklist.categorias', 'categorias')
        .leftJoinAndSelect('categorias.checklistPerguntas', 'checklistPerguntas')
        .where(
            `
            categorias.deleted_at is null and
            checklistPerguntas.deleted_at is null and
            CUP.id = :id`,
            { id: checklistUnidadeProdutivaId }
        )
        .getOne();

    if (
        CUPModel.checklist.fl_fluxo_aprovacao == 1 &&
        CUPModel.checklist.plano_acao === ChecklistPlanoAcao.obrigatorio
    ) {
        const pdaQuery = `
        SELECT id FROM plano_acoes 
        WHERE checklist_unidade_produtiva_id = :checklist_unidade_produtiva_id 
        AND status = 'rascunho'
        AND deleted_at IS NULL
        `;

        const [resultPDA] = await db.exec(pdaQuery, [CUPModel.id]);
        if (resultPDA.rows.length > 0) {
            const pdaId = resultPDA.rows.item(0).id;

            const todasPerguntas = _.flatMap(CUPModel.checklist.categorias, (v) => v.checklistPerguntas);

            await Promise.all(
                todasPerguntas.map(async (cp) => {
                    let resposta;
                    if (CUPModel.status === 'rascunho') {
                        const UPRModel = await getRepository(UnidadeProdutivaResposta)
                            .createQueryBuilder('UPR')
                            .leftJoinAndSelect('UPR.respostaModel', 'respostaModel')
                            .where(
                                `
                        UPR.unidade_produtiva_id = :uid and 
                        UPR.pergunta_id = :perguntaId and
                        UPR.deleted_at is null 
                    `,
                                { uid: CUPModel.unidade_produtiva_id, perguntaId: cp.pergunta_id }
                            )
                            .getOne();

                        if (UPRModel) {
                            resposta = UPRModel.respostaModel;
                        }
                    } else {
                        const CSRModel = await getRepository(ChecklistSnapshotRespostas)
                            .createQueryBuilder('CSR')
                            .leftJoinAndSelect('CSR.respostaModel', 'respostaModel')
                            .where(
                                `
                        CSR.checklist_unidade_produtiva_id = :cupid and 
                        CSR.pergunta_id = :perguntaId and
                        CSR.deleted_at is null
                    `,
                                { cupid: CUPModel.id, perguntaId: cp.pergunta_id }
                            )
                            .getOne();

                        if (CSRModel) {
                            resposta = CSRModel.respostaModel;
                        }
                    }

                    if (resposta) {
                        let prioridade;
                        let status;
                        if (resposta.cor === 'verde' || resposta.cor === 'cinza') {
                            prioridade = 'atendida';
                            status = 'concluido';
                        } else {
                            prioridade = cp.plano_acao_prioridade;
                            status = 'nao_iniciado';
                        }

                        const sqlUpdate = `
                            UPDATE plano_acao_itens
                               SET prioridade = :prioridade,
                                   status = :status,
                                   app_sync = 1
                             WHERE plano_acao_id = :planoAcaoId
                               AND checklist_pergunta_id = :checklistPerguntaId
                               AND (prioridade <> :currentPrioridade OR status <> :currentStatus)
                        `;

                        await db.exec(sqlUpdate, [prioridade, status, pdaId, cp.id, prioridade, status]);
                    }
                })
            );
        }
    }
};

const redirectPdaObrigatorio = async (ctx) => {
    const { checklistUnidadeProdutivaId } = ctx.props;

    const CUPModel = await getRepository(ChecklistUnidadeProdutiva)
        .createQueryBuilder('CUP')
        .leftJoinAndSelect('CUP.checklist', 'checklist')
        .where({ id: checklistUnidadeProdutivaId })
        .getOne();

    if (CUPModel.checklist.plano_acao == 'obrigatorio' || CUPModel.checklist.plano_acao == 'opcional') {
        ctx.props.unidadeProdutivaId = CUPModel.unidade_produtiva_id;
        ctx.props.produtorId = CUPModel.produtor_id;
        ctx.props.checklistUnidadeProdutiva = CUPModel.id;

        return ctx.path.true();
    } else {
        return ctx.path.false();
    }
};

const finalizaChecklist = async (ctx) => {
    const { props, db, state } = ctx;
    const { todasPerguntas, checklistUnidadeProdutivaId } = props;
    // soft deleta os snapshots
    await getConnection()
        .createQueryBuilder()
        .update(ChecklistSnapshotRespostas)
        .set({ app_sync: 1, deleted_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') })
        .where('checklist_unidade_produtiva_id = :cupID and deleted_at is null', { cupID: checklistUnidadeProdutivaId })
        .execute();

    // checklist_unidade_produtiva_id, pergunta_id, resposta_id, resposta
    // unidade_produtiva_respostas > checklist_snapshot_respostas
    // gera um snapshot

    const CUPModel = await getRepository(ChecklistUnidadeProdutiva)
        .createQueryBuilder('CUP')
        .leftJoinAndSelect('CUP.checklist', 'checklist')
        .where({ id: checklistUnidadeProdutivaId })
        .getOne();

    const respostas = await getRepository(UnidadeProdutivaResposta)
        .createQueryBuilder('UPR')

        .where(
            `
        unidade_produtiva_id = :uid and 
        deleted_at is null and 
         pergunta_id in (` +
                [-1, ...todasPerguntas.map((v) => v.pergunta_id)] +
                `)
    `,
            { uid: CUPModel.unidade_produtiva_id }
        )
        .getMany();

    const snapshotsPromises = respostas.map((respostaModel) => {
        const repo = getRepository(ChecklistSnapshotRespostas);
        const model = repo.create({
            checklist_unidade_produtiva_id: checklistUnidadeProdutivaId,
            pergunta_id: respostaModel.pergunta_id,
            resposta_id: respostaModel.resposta_id,
            resposta: respostaModel.resposta,
            app_sync: 1,
        });
        return repo.save(model);
    });

    await Promise.all(snapshotsPromises);

    // finaliza o model
    CUPModel.app_sync = 1;
    let updatePDARascunho = false;
    if (
        CUPModel.checklist.fl_fluxo_aprovacao == 1 &&
        CUPModel.checklist.plano_acao === ChecklistPlanoAcao.obrigatorio
    ) {
        CUPModel.status = ChecklistUnidadeProdutivaStatus.aguardando_pda;
        updatePDARascunho = true;
    } else {
        CUPModel.status = ChecklistUnidadeProdutivaStatus.finalizado;
        CUPModel.finished_at = moment().format('YYYY-MM-DD HH:mm:ss');
        CUPModel.finish_user_id = state.get('auth.user.id');
    }

    await getRepository(ChecklistUnidadeProdutiva).save(CUPModel);

    if (updatePDARascunho) {
        const pdaQuery = `
        SELECT id FROM plano_acoes 
        WHERE checklist_unidade_produtiva_id = :checklist_unidade_produtiva_id 
        AND status = 'rascunho'
        AND deleted_at IS NULL
        `;

        const [resultPDA] = await db.exec(pdaQuery, [CUPModel.id]);
        if (resultPDA.rows.length > 0) {
            const pdaId = resultPDA.rows.item(0).id;

            const pdaQueryUpdate = `
                UPDATE plano_acao_itens
                   SET checklist_snapshot_resposta_id = (
                            SELECT csr.id
                              FROM checklist_snapshot_respostas csr,
                                   checklist_perguntas cp
                             WHERE csr.checklist_unidade_produtiva_id = :checklistUnidadeProdutivaId
                               AND csr.pergunta_id = cp.pergunta_id
                               AND cp.id = plano_acao_itens.checklist_pergunta_id
                       ),
                       app_sync = 1
                 WHERE plano_acao_id = :planoAcaoId
            `;

            await db.exec(pdaQueryUpdate, [CUPModel.id, pdaId]);
        }
    }
};

// input : checklistUnidadeProdutivaId
const finalizarFlow = [
    ...offlineCheckFlow,
    ...syncFlow,
    verificaRespostasObrigatorias,

    when(props`isFormFilled`),
    {
        true: [
            finalizaChecklist,
            syncRespostasChecklistComItemPDA,
            ...syncFlow,
            redirectPdaObrigatorio,
            {
                true: [
                    modal(
                        {
                            title: 'Aviso',
                            content: `Formulário finalizado. Este formulário possui Plano de Ação. Caso deseje iniciá-lo, clique em 'Gerar Plano de Ação'.`,
                        },
                        [
                            { label: 'Continuar', path: 'nao' },
                            { label: 'Gerar Plano de Ação', path: 'sim' },
                        ]
                    ),
                    {
                        sim: [
                            ({ props }) => {
                                ActionRoute.go(
                                    `/planoAcao/${props.unidadeProdutivaId}/${props.produtorId}/${props.checklistUnidadeProdutiva}`
                                );
                            },
                        ],
                        nao: [],
                    },
                ],
                false: [],
            },
        ],
        false: [
            modal(
                {
                    title: 'Aviso',
                    content: `Para finalizar o formulário, é necessário responder as perguntas obrigatórias.`,
                },
                [{ label: 'ENTENDI', path: 'continue' }]
            ),
            {
                continue: [() => {}],
            },
        ],
    },
];

const loadFilesAndPhotos = [
    async ({ module, props, db }) => {
        const [files] = await db.exec(
            `SELECT * FROM checklist_unidade_produtiva_arquivos WHERE 
                tipo = 'arquivo' 
                AND checklist_unidade_produtiva_id = :checklist_unidade_produtiva_id 
                AND deleted_at is null`,
            [props.checklist_unidade_produtiva_id]
        );

        module.set('filesForm', files.rows.raw());
    },
    async ({ module, props, db }) => {
        const [files] = await db.exec(
            `SELECT * FROM checklist_unidade_produtiva_arquivos WHERE 
                tipo = 'imagem' 
                AND checklist_unidade_produtiva_id = :checklist_unidade_produtiva_id 
                AND deleted_at is null`,
            [props.checklist_unidade_produtiva_id]
        );

        module.set('photosForm', files.rows.raw());
    },
];

const resetFilesAndPhotos = [
    ({ module }) => {
        module.set('filesForm', null);
        module.set('photosForm', null);
    },
];

const addFile = [
    ...requestPermissionsFlow,

    async ({ props, state, db }) => {
        const { checklist_unidade_produtiva_id } = props;

        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });

            const filepath = RNFS.DocumentDirectoryPath + '/' + res.name;

            await RNFS.moveFile(res.uri, filepath)
                .then(async () => {
                    const ret = await db.insertOrUpdate('checklist_unidade_produtiva_arquivos', {
                        checklist_unidade_produtiva_id,
                        app_arquivo: res.name,
                        app_arquivo_caminho: filepath,
                        tipo: 'arquivo',
                    });

                    state.set('checklist.fileIdDescription', ret.id);
                })
                .catch((err) => {
                    console.log('Error: ' + err.message);
                });
        } catch (err) {
            console.log('Error: ' + err);
        }
    },
    syncFlow,
    loadFilesAndPhotos,
];

const addPhoto = [
    ...requestPermissionsFlow,
    async ({ props, state, db }) => {
        const { checklist_unidade_produtiva_id } = props;

        const options = {
            title: 'Selecione a foto',
            cancelButtonTitle: 'Cancelar',
            takePhotoButtonTitle: 'Tirar uma foto',
            chooseFromLibraryButtonTitle: 'Selecione da biblioteca',

            quality: 0.6,
            mediaType: 'photo',
            cameraType: 'back',
            allowsEditing: false,
            noData: true,
            maxWidth: 1280,
            maxHeight: 1280,

            storageOptions: {
                skipBackup: true,
                waitUntilSaved: true,
                privateDirectory: true,
            },
        };

        return new Promise((resolve, reject) => {
            try {
                ImagePicker.showImagePicker(options, async (res) => {
                    if (res.uri) {
                        const filepath = RNFS.DocumentDirectoryPath + '/' + res.fileName;

                        RNFS.moveFile(res.uri, filepath).then(async () => {
                            const ret = await db.insertOrUpdate('checklist_unidade_produtiva_arquivos', {
                                checklist_unidade_produtiva_id,
                                app_arquivo: res.fileName,
                                app_arquivo_caminho: filepath,
                                tipo: 'imagem',
                            });

                            state.set('checklist.fileIdDescription', ret.id);

                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    },
    syncFlow,
    loadFilesAndPhotos,
];

const editDescription = [
    ({ state, props }) => {
        state.set('checklist.fileIdDescription', props.id);
    },
];

const removeFile = [
    modal(
        {
            title: 'Aviso',
            content: 'Tem certeza que deseja remover o arquivo?',
        },
        [
            { label: 'NÃO', path: 'no' },
            { label: 'SIM', path: 'yes' },
        ]
    ),
    {
        no: [],
        yes: [
            ({ props, db }) => {
                const { id } = props;
                db.deleteItem('checklist_unidade_produtiva_arquivos', id);
            },
            loadFilesAndPhotos,
        ],
    },
];

const saveDescription = [
    async ({ props, state, db }) => {
        if (props.description) {
            await db.insertOrUpdate('checklist_unidade_produtiva_arquivos', {
                id: props.id,
                descricao: props.description,
            });
        }

        state.set('checklist.fileIdDescription', null);
    },
    loadFilesAndPhotos,
];

export default Module({
    state: {
        requestResultado: APIResponse(),

        filesForm: null,
        photosForm: null,
        fileIdDescription: null,
    },
    signals: {
        sync: syncFlow,
        syncRespostasChecklistComItemPDA: [syncRespostasChecklistComItemPDA],

        init: [syncFlow],

        loadFilesAndPhotos,
        resetFilesAndPhotos,
        removeFile,

        addFile,
        addPhoto,

        saveDescription,
        editDescription,

        alertErroCriacaoChecklist: [
            modal(
                {
                    title: 'Aviso',
                    content: props`mensagem`,
                },
                [{ label: 'ENTENDI', path: 'continue' }]
            ),
            {
                continue: [() => ActionRoute.back()],
            },
        ],

        excluir: [
            async (ctx) => {
                const { props, db } = ctx;
                const { checklistUnidadeProdutivaId } = props;

                const result = await modal(
                    {
                        title: 'Você tem certeza?',
                        content: 'Deseja realmente excluir o Formulário?',
                    },
                    [
                        { label: 'CONTINUAR', path: 'continuar' },
                        { label: 'CANCELAR', path: 'cancelar' },
                    ]
                )(ctx, true);

                if (result === 'continuar') {
                    await db.exec(
                        'UPDATE checklist_unidade_produtivas SET deleted_at = :deleted_at, app_sync = 1 WHERE id = :plano_acao_id',
                        [moment().format('YYYY-MM-DD HH:mm:ss'), checklistUnidadeProdutivaId]
                    );
                    return { removido: true };
                }
                return { removido: false };
            },
            when(props`removido`, (removido) => !!removido),
            {
                true: [
                    () => {
                        ActionRoute.go('/home');
                    },
                    toast({ text: 'Formulário removido com sucesso', type: 'info' }),
                ],
                false: [],
            },
        ],
        finalizar: finalizarFlow,

        carregarResultado: [
            ...offlineCheckFlow,
            when(state`offline.isOnline`),
            {
                true: [
                    prepareCarregarResultado,
                    ...post('/offline/checklist_score', 'checklist.requestResultado', props`variables`),
                    {
                        success: [],
                        error: [toastErrorRequest({ path: 'checklist.requestResultado' })],
                    },
                ],
                false: [],
            },
        ],
    },
});
