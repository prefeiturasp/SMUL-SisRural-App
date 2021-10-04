import { Module } from 'cerebral';
import { when } from 'cerebral/operators';
import { props } from 'cerebral/tags';
import groupBy from 'lodash/groupBy';
import { PermissionsAndroid } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-picker';
import { ActionRoute } from '../../components';
import { modal } from '../../modules/addons';
import { createSyncFlow } from '../../modules/DBModule';
import { deleteFromList, populateForm } from '../../utils/CerebralUtil';
import { toast } from './../../modules/ToastModule';

const syncFlow = createSyncFlow(false, false, false, true, false, false, false, false);

const resetState = (module) => {
    module.set('respostas', {});
    module.set('cadernoData', {});
    module.set('permissoes', {
        permiteAlterar: false,
    });
    module.set('filesForm', []);
};

const loadCaderno = [
    syncFlow,
    async (ctx) => {
        const { db, props, module } = ctx;
        const { cadernoCampoId } = props;

        resetState(module);

        // CADERNO DATA
        const [cadernoReq] = await db.exec('SELECT * FROM cadernos where id=:id and deleted_at is null', [
            cadernoCampoId,
        ]);
        const cadernoData = cadernoReq.rows.item(0);

        if (cadernoData.finish_user_id) {
            const [userFinishReq] = await db.exec('SELECT * FROM users where id=:id', [cadernoData.finish_user_id]);
            const userFinishData = userFinishReq.rows.item(0);
            cadernoData.user_finish = userFinishData.first_name + ' ' + userFinishData.last_name;
        }

        module.set('cadernoData', cadernoData);

        // PRODUTOR DATA
        await loadProdutor(module, db, cadernoData.produtor_id);

        // UNIDADE PROD DATA
        await loadUnidadeProdutiva(module, db, cadernoData.unidade_produtiva_id);

        // TEMPLATE
        const [templateReq] = await db.exec('select * from templates where id=:id and deleted_at is null', [
            cadernoData.template_id,
        ]);
        module.set('templateData', templateReq.rows.item(0));

        await loadAnexos(module, db, cadernoData.id);

        await loadPerguntas(module, db, module.get('templateData.id'));

        await loadRespostas(module, db, cadernoData.id);

        await setPermissoes(module, db, cadernoData, ctx);
    },
];

const setPermissoes = async (module, db, caderno, ctx) => {
    //P/ ver a permissão de remover
    let permiteDeletar = false;

    if (caderno && caderno.template_id) {
        const [templateReq] = await db.exec('select * from templates where id=:id and deleted_at is null', [
            caderno.template_id,
        ]);
        const template = templateReq.rows.item(0);
        const user = ctx.state.get('auth.user');

        permiteDeletar = user.dominio.id == template.dominio_id ? true : false;
    }

    module.set('permissoes', {
        permiteAlterar: caderno.can_update ? true : false,
        permiteDeletar,
    });
};

const loadProdutor = async (module, db, produtorId) => {
    // PRODUTOR
    const [produtorData] = await db.exec('SELECT * FROM produtores where id=:id and deleted_at is null', [produtorId]);
    module.set('produtorData', produtorData.rows.item(0));
};

const loadUnidadeProdutiva = async (module, db, unidadeProdutivaId) => {
    const [unidadeProdutivaData] = await db.exec(
        'SELECT * FROM unidade_produtivas where id=:id and deleted_at is null',
        [unidadeProdutivaId]
    );
    module.set('unidadeProdutivaData', unidadeProdutivaData.rows.item(0));
};

const loadPerguntas = async (module, db, templateId) => {
    // Seleciona as perguntas
    const [perguntasData] = await db.exec(
        `SELECT
    template_perguntas.*
FROM
    template_perguntas,
    template_pergunta_templates
WHERE
    template_id = :templateId
AND template_pergunta_id = template_perguntas.id
AND template_perguntas.deleted_at is null
AND template_pergunta_templates.deleted_at is null
ORDER BY
    ordem ASC`,
        [templateId]
    );

    const perguntas = perguntasData.rows.raw();

    const perguntasIds = perguntas.map((v) => v.id);

    // Seleciona as respostas ( tipo de pergunta = check)
    const [respostasData] = await db.exec(
        `SELECT
        *
    FROM
        template_respostas
    WHERE
        template_pergunta_id IN(${[-1, ...perguntasIds].join(',')})
    AND deleted_at IS NULL
    ORDER BY
        ordem ASC`
    );

    // agrupa as respostas por pergunta_id
    const respostasById = groupBy(respostasData.rows.raw(), 'template_pergunta_id');

    perguntas.forEach((pergunta) => {
        pergunta.respostas = respostasById[pergunta.id];
    });
    module.set('perguntasData', perguntas);
};

const loadRespostas = async (module, db, cadernoId) => {
    const [cadResCad] = await db.exec(
        `select caderno_resposta_caderno.*, template_perguntas.tipo AS template_perguntas_tipo FROM
        caderno_resposta_caderno, template_perguntas
        WHERE 
        template_pergunta_id = template_perguntas.id and template_perguntas.deleted_at is null AND
        caderno_id=:cadernoId AND caderno_resposta_caderno.deleted_at is null`,
        [cadernoId]
    );

    const respostas = cadResCad.rows.raw().reduce((acc, next) => {
        const tipo = next['template_perguntas_tipo'];

        let value = null;
        if (tipo === 'text') {
            value = next.resposta;
        } else if (tipo === 'check') {
            value = next.template_resposta_id;
        } else if (tipo === 'multiple_check') {
            if (acc[next.template_pergunta_id] && acc[next.template_pergunta_id].value) {
                value = acc[next.template_pergunta_id].value;
            } else {
                value = [];
            }

            value.push(next.template_resposta_id);
        }

        acc[next.template_pergunta_id] = {
            type: tipo,
            value,
        };

        return acc;
    }, {});

    module.set('respostas', respostas);
};

const loadAnexos = async (module, db, cadernoId) => {
    const [cadFiles] = await db.exec(
        `SELECT * FROM caderno_arquivos WHERE 
            tipo = 'arquivo' 
            AND caderno_id=:cadernoId 
            AND deleted_at is null`,
        [cadernoId]
    );

    module.set('filesForm', cadFiles.rows.raw());
};

const loadData = [
    syncFlow,
    // signal quando se tem o Id do produtor e o Id da unidadeProdutiva
    async (ctx) => {
        const { db, props, module } = ctx;
        const { produtorId, unidadeProdutivaId } = props;

        resetState(module);

        await loadProdutor(module, db, produtorId);

        // UNIDADE PRODUTIVA
        await loadUnidadeProdutiva(module, db, unidadeProdutivaId);

        // Seleciona o TEMPLATE
        const [templateData] = await db.exec(
            'SELECT * FROM templates where tipo="caderno" and deleted_at is null and can_apply = 1 limit 1'
        );

        if (templateData.rows.length === 0) {
            await modal(
                {
                    title: 'AVISO',
                    content:
                        'Não há template de caderno de campo para o seu domínio. Contate um administrador e/ou atualize os dados locais do aplicativo',
                },
                [{ label: 'Continuar', path: 'continuar' }]
            )(ctx, true);

            ActionRoute.replace(`/produtor/${module.get('produtorData.id')}`);

            return;
        }

        module.set('templateData', templateData.rows.item(0));

        // Verifica se já não existe um caderno de campo pronto no modo rascunho
        await loadPerguntas(module, db, module.get('templateData.id'));

        const [cadernoData] = await db.exec(
            `select * from cadernos 
        where template_id=:templateId and 
        produtor_id=:produtorId and 
        unidade_produtiva_id=:unidadeProdutivaId
        and status = 'rascunho' and deleted_at is null
        `,
            [module.get('templateData.id'), module.get('produtorData.id'), module.get('unidadeProdutivaData.id')]
        );

        await setPermissoes(module, db, { can_view: true, can_update: true, can_delete: true }, ctx);

        if (cadernoData.rows.length > 0) {
            const caderno = cadernoData.rows.raw()[0];
            module.set('cadernoData', caderno);

            // seleciona as respostas já preenchidas

            await loadRespostas(module, db, caderno.id);

            await loadAnexos(module, db, caderno.id);

            await setPermissoes(module, db, caderno, ctx);
        }
    },
];

const setResposta = [
    ({ props, module }) => {
        const { perguntaId, value } = props;
        module.set('respostas.' + perguntaId, value);
    },
];

const saveSilent = async (ctx) => {
    const { db, module, state, props } = ctx;
    if (props.status === 'finalizado') {
        const result = await modal(
            {
                title: 'Você tem certeza?',
                content: 'Uma vez concluído o caderno de campo não poderá ser alterado.',
            },
            [
                { label: 'CONTINUAR', path: 'continuar' },
                { label: 'CANCELAR', path: 'cancelar' },
            ]
        )(ctx, true);

        if (result === 'cancelar') {
            return { canceled: true };
        }
    }

    const caderno = module.get('cadernoData');

    const cadernoData = {
        ...caderno,
        template_id: module.get('templateData.id'),
        produtor_id: module.get('produtorData.id'),
        unidade_produtiva_id: module.get('unidadeProdutivaData.id'),
        user_id: state.get('auth.user.id'),
        status: props.status || 'rascunho',

        //Primeira inserção
        can_view: caderno.can_view == undefined ? true : caderno.can_view,
        can_update: caderno.can_update == undefined ? true : caderno.can_update,
        can_delete: caderno.can_delete == undefined ? true : caderno.can_delete,
    };
    const cadernoRet = await db.insertOrUpdate('cadernos', cadernoData);

    module.set('cadernoData.id', cadernoRet.id);

    //Adiciona Anexos
    const files = module.get('filesForm');

    await Promise.all(
        Object.keys(files).map((key) => {
            const { temp, ...file } = files[key]; //Remove o field "temp"

            const data = {
                ...file,
                caderno_id: module.get('cadernoData').id,
            };

            return db.insertOrUpdate('caderno_arquivos', data);
        })
    );

    //Remove Anexos
    const filesRemoved = module.get('filesFormDeleted');
    filesRemoved.map((v) => {
        db.deleteItem('caderno_arquivos', v);
    });

    //Respostas
    const respostas = module.get('respostas');

    await Promise.all(
        Object.keys(respostas)
            .map(async (perguntaId) => {
                if (isNaN(perguntaId)) {
                    return false;
                }

                const record = respostas[perguntaId];

                if (record.type === 'check' || record.type === 'text') {
                    // verifica se já não existe um registro, pode ser um registro ou N registros (Array = multipla escolha)
                    const [cadernoRespostaCadernoData] = await db.exec(
                        `select * from caderno_resposta_caderno where 
                caderno_id=:cadernoId and 
                template_pergunta_id=:templatePerguntaId and
                deleted_at is null`,
                        [cadernoRet.id, perguntaId]
                    );

                    if (cadernoRespostaCadernoData.rows.length === 0) {
                        // cria um registro novo
                        const data = {
                            caderno_id: cadernoRet.id,
                            template_pergunta_id: perguntaId,
                            template_resposta_id: record.type === 'check' ? record.value : null,
                            resposta: record.type === 'text' ? record.value : null,
                        };
                        return db.insertOrUpdate('caderno_resposta_caderno', data);
                    } else {
                        // registro já existente
                        const cadernoRespostaCaderno = cadernoRespostaCadernoData.rows.raw()[0];

                        // testa se houve mudança do valor
                        if (
                            (record.type === 'text' && cadernoRespostaCaderno.resposta != record.value) ||
                            (record.type === 'check' && cadernoRespostaCaderno.template_resposta_id !== record.value)
                        ) {
                            const data = {
                                ...cadernoRespostaCaderno,
                                resposta: record.type === 'text' ? record.value : null,
                                template_resposta_id: record.type === 'check' ? record.value : null,
                            };
                            return db.insertOrUpdate('caderno_resposta_caderno', data);
                        }
                    }
                } else {
                    const table = 'caderno_resposta_caderno';
                    const fk = 'caderno_id';
                    const fkValue = cadernoRet.id;

                    const fk2 = 'template_pergunta_id';
                    const fk2Value = perguntaId;

                    const column = 'template_resposta_id';

                    await db.insertMultiple(table, fk, fkValue, column, record.value, fk2, fk2Value);
                }
            })
            .filter((v) => !!v)
    );
    return { canceled: false };
};

const save = [
    saveSilent,
    when(props`canceled`),
    {
        true: [],
        false: [
            syncFlow,
            ({ module }) => {
                ActionRoute.replace(`/produtor/${module.get('produtorData.id')}`);
            },
            toast({ text: 'Caderno salvo com sucesso!', type: 'info' }),
        ],
    },
];

export const requestPermissionsFlow = [
    async function requestCameraPermission() {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
                title: 'Permissão para utilizar a camera',
                message: 'O aplicativo precisa de permissão para acessar a sua camera',
                buttonNeutral: 'Mais tarde',
                buttonNegative: 'Cancelar',
                buttonPositive: 'Permitir',
            });
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('You can use the camera');
            } else {
                console.log('Camera permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    },

    async function requestMediaPermission() {
        try {
            await PermissionsAndroid.requestMultiple(
                [
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                ],
                {
                    title: 'Permissão para utilizar a galeria de fotos',
                    message: 'O aplicativo precisa de permissão para acessar a galeria de fotos',
                    buttonNeutral: 'Mais tarde',
                    buttonNegative: 'Cancelar',
                    buttonPositive: 'Permitir',
                }
            );
        } catch (err) {
            console.warn(err);
        }
    },
];

const addPhoto = [
    ...requestPermissionsFlow,
    ({ module }) => {
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
                // path: 'shared',
                privateDirectory: true,
            },
        };

        return new Promise((resolve, reject) => {
            // try {
            ImagePicker.showImagePicker(options, (response) => {
                if (response.uri) {
                    const data = {
                        app_arquivo: response.fileName, // 'data:' + response.type + ';base64,' + response.data,
                        app_arquivo_caminho: response.uri,
                        id: null,
                        descricao: '',
                        tipo: 'imagem',
                        arquivo: null,
                        lat: null,
                        lng: null,
                        // lat: response.data.latitude,
                        // lng: response.data.longitude,
                    };

                    const form = module.get('photoForm');

                    const populatedForm = populateForm(form, data);

                    module.set('photoForm', populatedForm);
                    resolve({ hasLoadedImage: true });
                } else {
                    resolve({ hasLoadedImage: false });
                }
            });
        });
    },

    when(props`hasLoadedImage`),
    {
        true: [
            saveSilent,
            () => {
                ActionRoute.go('/editarCadernoCampo/novaFoto');
            },
        ],
        false: [],
    },
];

const savePhoto = [
    ({ db, module, forms }) => {
        const data = {
            ...forms.toJSON('cadernoCampo.photoForm'),
            caderno_id: module.get('cadernoData').id,
        };
        db.insertOrUpdate('caderno_arquivos', data);

        ActionRoute.go('/editarCadernoCampo/' + module.get('cadernoData.id'));
    },
];

const imageThumbPress = [
    async ({ props, module, db }) => {
        const { imageId } = props;
        const [
            query,
        ] = await db.exec(
            'select id,app_arquivo,app_arquivo_caminho,arquivo,descricao,tipo,lat,lng,caderno_id from caderno_arquivos where id=:id and deleted_at is null',
            [imageId]
        );

        if (query.rows.length == 0) {
            return;
        }

        const record = query.rows.item(0);

        const form = module.get('photoForm');

        const newForm = populateForm(form, record);
        module.set('photoForm', newForm);
        ActionRoute.go('/editarCadernoCampo/novaFoto');
    },
];

const addFile = [
    ...requestPermissionsFlow,
    async ({ module }) => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });

            const filepath = RNFS.DocumentDirectoryPath + '/' + res.name;

            RNFS.moveFile(res.uri, filepath)
                .then((success) => {
                    const data = {
                        app_arquivo: res.name,
                        app_arquivo_caminho: filepath,
                        id: null,
                        descricao: '',
                        tipo: 'arquivo',
                        arquivo: null,
                        lat: null,
                        lng: null,
                        temp: true, //utilizado para remover sem mexer no DB
                    };

                    const filesForm = module.get('filesForm');
                    module.set('filesForm.' + filesForm.length, data);
                })
                .catch((err) => {
                    console.log('Error: ' + err.message);
                });
        } catch (err) {
            console.log(err);
        }
    },
];

const removeFile = [
    ({ props, state }) => {
        const { position } = props;

        const path = 'cadernoCampo.filesForm';
        const pathDeleted = 'cadernoCampo.filesFormDeleted';

        const data = state.get(`${path}.${position}`);

        deleteFromList(path, pathDeleted, position, data, state, data.temp ? false : true);
    },
];

const removePhoto = [
    modal(
        {
            title: 'Aviso',
            content: 'Tem certeza que deseja remover a foto do caderno de campo?',
        },
        [
            { label: 'NÃO', path: 'no' },
            { label: 'SIM', path: 'yes' },
        ]
    ),
    {
        no: [],
        yes: [
            async ({ db, props }) => {
                await db.deleteItem('caderno_arquivos', props.id);
            },
            () => {
                ActionRoute.back();
            },
            toast({ text: 'Foto removida com sucesso!', type: 'info' }),
        ],
    },
];

const deleteCaderno = [
    modal(
        {
            title: 'Aviso',
            content: 'Tem certeza que deseja remover o caderno de campo?',
        },
        [
            { label: 'NÃO', path: 'no' },
            { label: 'SIM', path: 'yes' },
        ]
    ),
    {
        no: [],
        yes: [
            async ({ props, db }) => {
                await db.deleteItem('cadernos', props.id);
            },
            syncFlow,
            () => {
                ActionRoute.replace('/home');
            },
        ],
    },
];

export default Module({
    state: {
        cadernoData: null,
        unidadeProdutivaData: null,
        produtorData: null,
        templateData: null,
        perguntasData: [],
        respostas: {},

        filesForm: [],
        filesFormDeleted: [],

        photoForm: {
            id: {
                value: null,
                defaultValue: null,
            },
            descricao: {
                value: '',
                defaultValue: '',
            },
            tipo: {
                value: 'imagem',
                defaultValue: 'imagem',
            },
            lat: {
                value: __DEV__ ? '-29.1615568' : null,
                defaultValue: __DEV__ ? '-29.1615568' : null,
            },
            lng: {
                value: __DEV__ ? '-51.175104' : null,
                defaultValue: __DEV__ ? '-51.175104' : null,
            },
            arquivo: { value: null, defaultValue: null },
            app_arquivo: { value: null, defaultValue: null },
            app_arquivo_caminho: { value: null, defaultValue: null },
        },

        permissoes: {
            permiteAlterar: false,
        },
    },
    signals: {
        loadData,
        loadCaderno,
        setResposta,
        save,
        saveSilent: [saveSilent],
        addPhoto,
        savePhoto,
        imageThumbPress,
        addFile,
        removeFile,
        removePhoto,
        delete: deleteCaderno,
        sync: syncFlow,
    },
});

//- pega o template,
//- pega as perguntas baseado no template_pergunta_template
