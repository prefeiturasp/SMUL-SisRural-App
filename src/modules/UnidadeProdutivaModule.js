import { deleteFromList, setFormData } from '../utils/CerebralUtil';
import { props, state } from 'cerebral/tags';

import DocumentPicker from 'react-native-document-picker';
import { Module } from 'cerebral';
import RNFS from 'react-native-fs';
import cloneDeep from 'lodash/cloneDeep';
import { createSyncFlow } from './DBModule';
import moment from 'moment';
import resetFormCustom from './form/resetFormCustom';
import { set } from 'cerebral/operators';
import { toast } from './ToastModule';

const syncFlow = createSyncFlow(false, false, true, false, false, false, false, false);

const emptyPessoa = {
    id: {
        value: '',
    },
    nome: {
        value: '',
        validationRules: ['isRequired'],
    },
    cpf: {
        value: '',
    },
    funcao: {
        value: '',
    },
    relacao_id: {
        value: '',
        validationRules: ['isRequired'],
    },
    dedicacao_id: {
        value: '',
    },
    deleted_at: {
        value: null,
    },
};

const emptyUsoSolo = {
    id: {
        value: '',
    },
    solo_categoria_id: {
        value: '',
        validationRules: ['isRequired'],
    },
    area: {
        value: '',
    },
    quantidade: {
        value: '',
    },
    descricao: {
        value: '',
    },
    deleted_at: {
        value: null,
    },
};

const emptyInfraEstrutura = {
    id: {
        value: '',
    },
    instalacao_tipo_id: {
        value: '',
        validationRules: ['isRequired'],
    },
    descricao: {
        value: '',
        validationRules: ['isRequired'],
    },
    quantidade: {
        value: '',
    },
    area: {
        value: '',
    },
    observacao: {
        value: '',
    },
    // localizacao: { //Pediram para tirar
    //     value: '',
    // },
    deleted_at: {
        value: null,
    },
};

const addArquivo = [
    async ({ module }) => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });

            const filepath = RNFS.DocumentDirectoryPath + '/' + res.name;

            RNFS.moveFile(res.uri, filepath)
                .then(success => {
                    const data = {
                        app_arquivo: res.name,
                        app_arquivo_caminho: filepath,
                        id: null,
                        descricao: '',
                        tipo: 'arquivo',
                        arquivo: null,
                        lat: null,
                        lng: null,
                        temp: true,
                    };

                    const arquivosForm = module.get('arquivosForm');
                    module.set('arquivosForm.' + arquivosForm.length, data);
                })
                .catch(err => {
                    console.log('Error: ' + err.message);
                });
        } catch (err) {
            console.log('Error: ', err);
        }
    },
];

const removeArquivo = [
    ({ props, state }) => {
        const { position } = props;

        const path = 'unidProdutiva.arquivosForm';
        const pathDeleted = 'unidProdutiva.arquivosFormDeleted';

        const data = state.get(`${path}.${position}`);

        deleteFromList(path, pathDeleted, position, data, state, data.temp ? false : true);
    },
];

const reset = [
    set(state`unidProdutiva.step`, 0),
    set(state`unidProdutiva.formListPessoas`, []),
    set(state`unidProdutiva.formListUsoSolo`, []),
    set(state`unidProdutiva.formListInfraEstrutura`, []),
    set(state`unidProdutiva.arquivosForm`, []),
    set(state`unidProdutiva.arquivosFormDeleted`, []),
    set(state`unidProdutiva.loading`, false),
    resetFormCustom(state`unidProdutiva.formDadosBasicos`),
    resetFormCustom(state`unidProdutiva.formDadosComplementares`),
    resetFormCustom(state`unidProdutiva.formPressaoSocial`),
    resetFormCustom(state`unidProdutiva.formComercializacao`),
    resetFormCustom(state`unidProdutiva.formAgua`),
    resetFormCustom(state`unidProdutiva.formUsoSolo`),
];

const salvarArquivos = [
    async ({ module, db }) => {
        const files = module.get('arquivosForm');

        //Adicionar Arquivos
        await Promise.all(
            Object.keys(files).map(key => {
                const { temp, ...file } = files[key];

                const data = {
                    ...file,
                    unidade_produtiva_id: module.get('formDadosBasicos').id.value,
                };

                return db.insertOrUpdate('unidade_produtiva_arquivos', data);
            })
        );

        //Remove Arquivos
        const filesRemoved = module.get('arquivosFormDeleted');
        filesRemoved.map(v => {
            db.deleteItem('unidade_produtiva_arquivos', v);
        });
    },
    syncFlow,
    toast({ text: 'Arquivos salvos com sucesso!', type: 'info' }),
];

const loadArquivos = async (module, db, unidProdutivaId) => {
    const [arquivos] = await db.exec(
        `SELECT * FROM unidade_produtiva_arquivos WHERE 
            unidade_produtiva_id=:unidade_produtiva_id 
            AND deleted_at is null`,
        [unidProdutivaId]
    );

    module.set('arquivosForm', arquivos.rows.raw());
};

const loadCertificacoes = async (state, db, dataUnidadeProdutiva) => {
    const certificacoes = await db.selectMultiple(
        'unidade_produtiva_certificacoes',
        'unidade_produtiva_id',
        dataUnidadeProdutiva.id,
        'certificacao_id'
    );

    setFormData('unidProdutiva.formDadosComplementares', { ...dataUnidadeProdutiva, certificacoes }, state);
};

const loadPressaoSocial = async (state, db, dataUnidadeProdutiva) => {
    const pressaoSociais = await db.selectMultiple(
        'unidade_produtiva_pressao_sociais',
        'unidade_produtiva_id',
        dataUnidadeProdutiva.id,
        'pressao_social_id'
    );

    setFormData('unidProdutiva.formPressaoSocial', { ...dataUnidadeProdutiva, pressaoSociais }, state);
};

const loadCanaisComercializacao = async (state, db, dataUnidadeProdutiva) => {
    const canaisComercializacao = await db.selectMultiple(
        'unidade_produtiva_canal_comercializacoes',
        'unidade_produtiva_id',
        dataUnidadeProdutiva.id,
        'canal_comercializacao_id'
    );

    setFormData(
        'unidProdutiva.formComercializacao',
        {
            ...dataUnidadeProdutiva,
            canaisComercializacao,
        },
        state
    );
};

const loadAguas = async (state, db, dataUnidadeProdutiva) => {
    const tiposFonteAgua = await db.selectMultiple(
        'unidade_produtiva_tipo_fonte_aguas',
        'unidade_produtiva_id',
        dataUnidadeProdutiva.id,
        'tipo_fonte_agua_id'
    );

    const riscosContaminacaoAgua = await db.selectMultiple(
        'unidade_produtiva_risco_contaminacao_aguas',
        'unidade_produtiva_id',
        dataUnidadeProdutiva.id,
        'risco_contaminacao_agua_id'
    );

    const residuoSolidos = await db.selectMultiple(
        'unidade_produtiva_residuo_solidos',
        'unidade_produtiva_id',
        dataUnidadeProdutiva.id,
        'residuo_solido_id'
    );

    const esgotamentoSanitarios = await db.selectMultiple(
        'unidade_produtiva_esgotamento_sanitarios',
        'unidade_produtiva_id',
        dataUnidadeProdutiva.id,
        'esgotamento_sanitario_id'
    );

    setFormData(
        'unidProdutiva.formAgua',
        {
            ...dataUnidadeProdutiva,
            tiposFonteAgua,
            riscosContaminacaoAgua,
            residuoSolidos,
            esgotamentoSanitarios,
        },
        state
    );
};

const loadSolos = async (state, db, dataUnidadeProdutiva) => {
    const solosCategoria = await db.selectMultiple(
        'unidade_produtiva_solo_categorias',
        'unidade_produtiva_id',
        dataUnidadeProdutiva.id,
        'solo_categoria_id'
    );

    setFormData(
        'unidProdutiva.formUsoSolo',
        {
            ...dataUnidadeProdutiva,
            solosCategoria,
        },
        state
    );
};

const loadPessoas = async (state, db, dataUnidadeProdutiva) => {
    //Pessoas
    const [dataPessoas] = await db.exec(
        'SELECT * FROM colaboradores where unidade_produtiva_id = :id AND deleted_at IS NULL',
        [dataUnidadeProdutiva.id]
    );

    dataPessoas.rows.raw().map((v, k) => {
        const pathForm = 'unidProdutiva.formListPessoas.' + k;
        state.set(pathForm, cloneDeep(emptyPessoa));
        setFormData(pathForm, v, state);
    });
};

const loadOnlyPessoas = ({ state, db }) => {
    state.set('unidProdutiva.formListPessoas', []);
    return loadPessoas(state, db, { id: state.get('unidProdutiva.formDadosBasicos.id.value') });
};

const loadUsoSolo = async (state, db, dataUnidadeProdutiva) => {
    //Uso do Solo
    const [dataUsoSolo] = await db.exec(
        'SELECT * FROM unidade_produtiva_caracterizacoes where unidade_produtiva_id = :id AND deleted_at IS NULL',
        [dataUnidadeProdutiva.id]
    );

    dataUsoSolo.rows.raw().map(async (v, k) => {
        const pathForm = 'unidProdutiva.formListUsoSolo.' + k;
        state.set(pathForm, cloneDeep(emptyUsoSolo));

        setFormData(
            pathForm,
            {
                ...v,
            },
            state
        );
    });
};

const loadOnlyUsoSolo = ({ state, db }) => {
    state.set('unidProdutiva.formListUsoSolo', []);
    return loadUsoSolo(state, db, { id: state.get('unidProdutiva.formDadosBasicos.id.value') });
};

const loadInfra = async (state, db, dataUnidadeProdutiva) => {
    //Infra-estrutura
    const [dataInfraEstrutra] = await db.exec(
        'SELECT * FROM instalacoes where unidade_produtiva_id = :id AND deleted_at IS NULL',
        [dataUnidadeProdutiva.id]
    );
    dataInfraEstrutra.rows.raw().map((v, k) => {
        const pathForm = 'unidProdutiva.formListInfraEstrutura.' + k;
        state.set(pathForm, cloneDeep(emptyInfraEstrutura));
        setFormData(pathForm, v, state);
    });
};

const loadOnlyInfra = ({ state, db }) => {
    state.set('unidProdutiva.formListInfraEstrutura', []);
    return loadInfra(state, db, { id: state.get('unidProdutiva.formDadosBasicos.id.value') });
};

const goStep = [set(state`unidProdutiva.step`, props`step`)];

const salvarDadosBasicos = [
    prepareDadosBasicos,
    async ({ db, forms, props }) => {
        const data = forms.toJSON('unidProdutiva.formDadosBasicos');

        const ret = await db.insertOrUpdate('unidade_produtivas', data);
        props.id = ret.id;

        //Vincula o Produtor com a Unidade Produtiva recem criada ... só para cadastros de UNIDADES PRODUTIVAS NOVAS (por isso o teste no 'data.id')
        if (!data.id && ret.id && props.produtorId) {
            await db.insertOrUpdate('produtor_unidade_produtiva', {
                produtor_id: props.produtorId,
                unidade_produtiva_id: ret.id,
                tipo_posse_id: 1,
            });
        }

        if (data.id) {
            props.message = 'Unidade Produtiva atualizada com sucesso!';
        } else {
            props.message = 'Unidade Produtiva criada com sucesso!';
        }
    },
    set(state`unidProdutiva.step`, 1),

    ...createSyncFlow(false, true, true, false, false, false, false, false),

    set(state`unidProdutiva.formDadosBasicos.id.value`, props`id`),
    set(state`unidProdutiva.formDadosComplementares.id.value`, props`id`),
    set(state`unidProdutiva.formPressaoSocial.id.value`, props`id`),
    set(state`unidProdutiva.formCaracterizacao.id.value`, props`id`),
    set(state`unidProdutiva.formAgua.id.value`, props`id`),
    set(state`unidProdutiva.formUsoSolo.id.value`, props`id`),
    set(state`unidProdutiva.formComercializacao.id.value`, props`id`),

    toast({ text: props`message`, type: 'info' }),
];

const salvarDadosComplementares = [
    prepareDadosComplementares,
    async ({ db, forms }) => {
        const { certificacoes, ...data } = forms.toJSON('unidProdutiva.formDadosComplementares');

        await db.insertOrUpdate('unidade_produtivas', data);

        await db.insertMultiple(
            'unidade_produtiva_certificacoes',
            'unidade_produtiva_id',
            data.id,
            'certificacao_id',
            certificacoes
        );
    },
    syncFlow,
    set(state`unidProdutiva.step`, 2),
    toast({ text: 'Unidade Produtiva atualizada com sucesso!', type: 'info' }),
];

const salvarUsoSolo = [
    prepareUsoSolo,
    async ({ db, forms }) => {
        const { solosCategoria, ...data } = forms.toJSON('unidProdutiva.formUsoSolo');

        await db.insertOrUpdate('unidade_produtivas', data);

        await db.insertMultiple(
            'unidade_produtiva_solo_categorias',
            'unidade_produtiva_id',
            data.id,
            'solo_categoria_id',
            solosCategoria
        );
    },
    async ({ state, db, forms }) => {
        const unidade_produtiva_id = state.get('unidProdutiva.formDadosBasicos.id.value');

        const list = state.get('unidProdutiva.formListUsoSolo');

        list.map(async (v, k) => {
            const { ...formData } = forms.toJSON('unidProdutiva.formListUsoSolo.' + k);

            const unidProdCaracterizacao = await db.insertOrUpdate('unidade_produtiva_caracterizacoes', {
                unidade_produtiva_id,
                ...formData,
            });
        });
    },
    syncFlow,
    set(state`unidProdutiva.step`, 3),
    loadOnlyUsoSolo,
    toast({ text: 'Unidade Produtiva atualizada com sucesso!', type: 'info' }),
];

const salvarComercializacao = [
    prepareComercializacao,
    async ({ db, forms }) => {
        const { canaisComercializacao, ...data } = forms.toJSON('unidProdutiva.formComercializacao');
        await db.insertOrUpdate('unidade_produtivas', data);

        await db.insertMultiple(
            'unidade_produtiva_canal_comercializacoes',
            'unidade_produtiva_id',
            data.id,
            'canal_comercializacao_id',
            canaisComercializacao
        );
    },
    syncFlow,
    set(state`unidProdutiva.step`, 4),
    toast({ text: 'Unidade Produtiva atualizada com sucesso!', type: 'info' }),
];

const salvarAgua = [
    prepareAgua,
    async ({ db, forms }) => {
        const { tiposFonteAgua, riscosContaminacaoAgua, residuoSolidos, esgotamentoSanitarios, ...data } = forms.toJSON(
            'unidProdutiva.formAgua'
        );
        await db.insertOrUpdate('unidade_produtivas', data);

        await db.insertMultiple(
            'unidade_produtiva_tipo_fonte_aguas',
            'unidade_produtiva_id',
            data.id,
            'tipo_fonte_agua_id',
            tiposFonteAgua
        );

        await db.insertMultiple(
            'unidade_produtiva_risco_contaminacao_aguas',
            'unidade_produtiva_id',
            data.id,
            'risco_contaminacao_agua_id',
            riscosContaminacaoAgua
        );
        
        await db.insertMultiple(
            'unidade_produtiva_residuo_solidos',
            'unidade_produtiva_id',
            data.id,
            'residuo_solido_id',
            residuoSolidos
        );
        
        await db.insertMultiple(
            'unidade_produtiva_esgotamento_sanitarios',
            'unidade_produtiva_id',
            data.id,
            'esgotamento_sanitario_id',
            esgotamentoSanitarios
        );
    },
    syncFlow,
    set(state`unidProdutiva.step`, 5),
    toast({ text: 'Unidade Produtiva atualizada com sucesso!', type: 'info' }),
];

const salvarPessoas = [
    async ({ state, db, forms }) => {
        const unidade_produtiva_id = state.get('unidProdutiva.formDadosBasicos.id.value');

        const list = state.get('unidProdutiva.formListPessoas');
        const promises = list.map((v, k) => {
            const formData = forms.toJSON('unidProdutiva.formListPessoas.' + k);

            return db.insertOrUpdate('colaboradores', { unidade_produtiva_id, ...formData });
        });

        await Promise.all(promises);
    },
    syncFlow,
    set(state`unidProdutiva.step`, 6),
    loadOnlyPessoas,
    toast({ text: 'Unidade Produtiva atualizada com sucesso!', type: 'info' }),
];

const salvarInfraEstrutura = [
    async ({ state, db, forms }) => {
        const unidade_produtiva_id = state.get('unidProdutiva.formDadosBasicos.id.value');

        const list = state.get('unidProdutiva.formListInfraEstrutura');
        const promises = list.map((v, k) => {
            const formData = forms.toJSON('unidProdutiva.formListInfraEstrutura.' + k);

            return db.insertOrUpdate('instalacoes', { unidade_produtiva_id, ...formData });
        });

        await Promise.all(promises);

        // ActionRoute.go('/home');
    },
    syncFlow,
    set(state`unidProdutiva.step`, 7),
    loadOnlyInfra,
    toast({ text: 'Unidade Produtiva atualizada com sucesso!', type: 'info' }),
];

const salvarPressaoSocial = [
    preparePressaoSocial,
    async ({ db, forms }) => {
        const { pressaoSociais, ...data } = forms.toJSON('unidProdutiva.formPressaoSocial');

        await db.insertOrUpdate('unidade_produtivas', data);

        await db.insertMultiple(
            'unidade_produtiva_pressao_sociais',
            'unidade_produtiva_id',
            data.id,
            'pressao_social_id',
            pressaoSociais
        );
    },
    syncFlow,
    set(state`unidProdutiva.step`, 8),
    toast({ text: 'Unidade Produtiva atualizada com sucesso!', type: 'info' }),
];

const fetchUnidProdutiva = [
    set(state`unidProdutiva.loading`, true),

    async ({ db, module, props, state }) => {
        const [data] = await db.exec('SELECT * FROM unidade_produtivas WHERE id=:id AND deleted_at IS NULL', [
            props.unidadeProdutivaId,
        ]);

        if (data.rows.length > 0) {
            const dataUnidadeProdutiva = data.rows.item(0);

            setFormData('unidProdutiva.formDadosBasicos', dataUnidadeProdutiva, state);

            loadCertificacoes(state, db, dataUnidadeProdutiva);

            loadPressaoSocial(state, db, dataUnidadeProdutiva);

            loadCanaisComercializacao(state, db, dataUnidadeProdutiva);

            loadAguas(state, db, dataUnidadeProdutiva);

            loadSolos(state, db, dataUnidadeProdutiva);

            loadArquivos(module, db, dataUnidadeProdutiva.id);

            loadPessoas(state, db, dataUnidadeProdutiva);

            loadUsoSolo(state, db, dataUnidadeProdutiva);

            loadInfra(state, db, dataUnidadeProdutiva);
        }
    },
    set(state`unidProdutiva.loading`, false),
];

export default Module({
    state: {
        step: 0,
        loading: false,

        arquivosForm: [],
        arquivosFormDeleted: [],

        formDadosBasicos: {
            id: {
                value: '',
            },
            nome: {
                value: '',
                validationRules: ['isRequired'],
            },
            cep: {
                value: '',
            },
            endereco: {
                value: '',
                validationRules: ['isRequired'],
            },
            bairro: {
                value: '',
            },
            estado_id: {
                value: '',
                validationRules: ['isRequired'],
            },
            cidade_id: {
                value: '',
                validationRules: ['isRequired'],
            },
            bacia_hidrografica: {
                value: '',
            },
            status: {
                value: '',
                validationRules: ['isRequired'],
            },
            status_observacao: {
                value: '',
            },
            lat: {
                value: '',
                // validationRules: ['isRequired'],
            },
            lng: {
                value: '',
                // validationRules: ['isRequired'],
            },
        },

        formDadosComplementares: {
            id: {
                value: '',
            },
            fl_certificacoes: {
                value: '',
            },
            certificacoes: {
                value: [],
                defaultValue: [],
            },
            certificacoes_descricao: {
                value: '',
            },
            fl_car: {
                value: '',
            },
            car: {
                value: '',
            },
            fl_ccir: {
                value: '',
            },
            fl_itr: {
                value: '',
            },
            fl_matricula: {
                value: '',
            },
            upa: {
                value: '',
            },
        },

        formPressaoSocial: {
            id: {
                value: '',
            },
            fl_pressao_social: {
                value: '',
            },
            pressaoSociais: {
                value: [],
                defaultValue: [],
            },
            pressao_social_descricao: {
                value: '',
            },
        },

        formComercializacao: {
            id: {
                value: '',
            },
            fl_comercializacao: {
                value: '',
            },
            canaisComercializacao: {
                value: [],
                defaultValue: [],
            },
            gargalos: {
                value: '',
            },
        },
        formAgua: {
            id: {
                value: '',
            },
            outorga_id: {
                value: '',
            },
            tiposFonteAgua: {
                value: [],
                defaultValue: [],
            },
            fl_risco_contaminacao: {
                value: '',
            },
            riscosContaminacaoAgua: {
                value: [],
                defaultValue: [],
            },
            risco_contaminacao_observacoes: {
                value: '',
            },
            residuoSolidos: {
                value: [],
                defaultValue: [],
            },
            esgotamentoSanitarios: {
                value: [],
                defaultValue: [],
            },
        },
        formUsoSolo: {
            id: {
                value: '',
            },
            area_total_solo: {
                value: '',
            },
            fl_producao_processa: {
                value: '',
            },
            producao_processa_descricao: {
                value: '',
            },
            solosCategoria: {
                value: [],
                defaultValue: [],
            },
            outros_usos_descricao: {
                value: '',
            },
        },

        formListPessoas: [],
        formListUsoSolo: [],
        formListInfraEstrutura: [],
    },
    signals: {
        addArquivo,
        removeArquivo,
        salvarArquivos,

        reset,
        goStep,

        removePessoa: [removePessoa, saveRemovePessoa, loadOnlyPessoas],
        removeUsoSolo: [removeUsoSolo, saveRemoveUsoSolo, loadOnlyUsoSolo],
        removeInfraEstrutura: [removeInfraEstrutura, saveRemoveInfraEstrutura, loadOnlyInfra],

        addPessoa: [addPessoa],
        addUsoSolo: [addUsoSolo],
        addInfraEstrutura: [addInfraEstrutura],

        fetchUnidProdutiva,

        salvarDadosBasicos,

        salvarDadosComplementares,

        salvarPressaoSocial,

        salvarComercializacao,

        salvarAgua,

        salvarUsoSolo,

        salvarPessoas,

        salvarInfraEstrutura,
    },
});

function prepareDadosBasicos({ props, forms }) {
    props.variables = forms.toJSON('unidProdutiva.formDadosBasicos');
}

function prepareDadosComplementares({ props, forms }) {
    props.variables = forms.toJSON('unidProdutiva.formDadosComplementares');
}

function preparePressaoSocial({ props, forms }) {
    props.variables = forms.toJSON('unidProdutiva.formPressaoSocial');
}

function prepareComercializacao({ props, forms }) {
    props.variables = forms.toJSON('unidProdutiva.formComercializacao');
}

function prepareAgua({ props, forms }) {
    props.variables = forms.toJSON('unidProdutiva.formAgua');
}

function prepareUsoSolo({ props, forms }) {
    props.variables = forms.toJSON('unidProdutiva.formUsoSolo');
}

function addPessoa({ module }) {
    const formListPessoas = module.get('formListPessoas');

    const length = formListPessoas.length;

    module.set('formListPessoas.' + length, cloneDeep(emptyPessoa));
}

function removePessoa({ module, props }) {
    const { position } = props;

    let data = module.get('formListPessoas.' + position);
    data.deleted_at = { value: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') };

    module.set('formListPessoas.' + position, data);
}

function saveRemovePessoa({ props, state, db, forms }) {
    const { position } = props;

    const unidade_produtiva_id = state.get('unidProdutiva.formDadosBasicos.id.value');

    const formData = forms.toJSON('unidProdutiva.formListPessoas.' + position);
    if (formData.id) {
        return db.insertOrUpdate('colaboradores', { unidade_produtiva_id, ...formData });
    } else {
        return null;
    }
}

function addUsoSolo({ module }) {
    const formListUsoSolo = module.get('formListUsoSolo');

    const length = formListUsoSolo.length;

    module.set('formListUsoSolo.' + length, cloneDeep(emptyUsoSolo));
}

function removeUsoSolo({ module, props }) {
    const { position } = props;

    let data = module.get('formListUsoSolo.' + position);
    data.deleted_at = { value: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') };

    module.set('formListUsoSolo.' + position, data);
}

function saveRemoveUsoSolo({ props, state, db, forms }) {
    const { position } = props;

    const unidade_produtiva_id = state.get('unidProdutiva.formDadosBasicos.id.value');

    const formData = forms.toJSON('unidProdutiva.formListUsoSolo.' + position);
    if (formData.id) {
        return db.insertOrUpdate('unidade_produtiva_caracterizacoes', { unidade_produtiva_id, ...formData });
    } else {
        return null;
    }
}

function addInfraEstrutura({ module }) {
    const formListInfraEstrutura = module.get('formListInfraEstrutura');

    const length = formListInfraEstrutura.length;

    module.set('formListInfraEstrutura.' + length, cloneDeep(emptyInfraEstrutura));
}

function removeInfraEstrutura({ module, props }) {
    const { position } = props;

    let data = module.get('formListInfraEstrutura.' + position);
    data.deleted_at = { value: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') };

    module.set('formListInfraEstrutura.' + position, data);
}

function saveRemoveInfraEstrutura({ props, state, db, forms }) {
    const { position } = props;

    const unidade_produtiva_id = state.get('unidProdutiva.formDadosBasicos.id.value');

    const formData = forms.toJSON('unidProdutiva.formListInfraEstrutura.' + position);
    if (formData.id) {
        return db.insertOrUpdate('instalacoes', { unidade_produtiva_id, ...formData });
    } else {
        return null;
    }
}
