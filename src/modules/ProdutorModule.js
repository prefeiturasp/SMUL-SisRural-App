import { props, state } from 'cerebral/tags';

import { ActionRoute } from '../components';
import { Module } from 'cerebral';
import cloneDeep from 'lodash/cloneDeep';
import { createSyncFlow } from './DBModule';
import isNaN from 'lodash/isNaN';
import { modal } from './addons';
import resetFormCustom from './form/resetFormCustom';
import { set } from 'cerebral/operators';
import { setFormData } from '../utils/CerebralUtil';
import { toast } from './ToastModule';

const emptyUnidadeProdutiva = {
    id: {
        value: '',
    },
    unidade_produtiva_id: {
        value: '',
        validationRules: ['isRequired'],
    },
    tipo_posse_id: {
        value: '',
        validationRules: ['isRequired'],
    },
};

export default Module({
    state: {
        step: 0,

        formListUnidadeProdutiva: [],
        formListUnidadeProdutivaDeleted: [],

        //subpage cadastro basico
        formCadastroBasico: {
            id: {
                value: null,
            },

            nome: {
                value: '',
                validationRules: ['isRequired'],
            },
            cpf: {
                value: '',
                validationRules: ['isCpf'],
            },
            telefone_1: {
                value: '',
            },
            telefone_2: {
                value: '',
            },
            status: {
                value: '',
                validationRules: ['isRequired'],
            },
            status_observacao: {
                value: '',
            },
            tags: {
                value: '',
            },
        },

        //subpage produtor
        formProdutor: {
            id: {
                value: '',
            },
            /*tipo: {
                value: '',
                validationRules: ['isRequired'],
            },*/
            nome_social: {
                value: '',
            },
            email: {
                value: '',
                validationRules: ['isEmail'],
            },
            genero_id: {
                value: '',
            },
            etinia_id: {
                value: '',
            },
            fl_portador_deficiencia: {
                value: '',
            },
            portador_deficiencia_obs: {
                value: '',
            },
            data_nascimento: {
                value: '',
                validationRules: ['isDate'],
            },
            rg: {
                value: '',
            },
            fl_cnpj: {
                value: '',
            },
            cnpj: {
                value: '',
                validationRules: ['isCnpj'],
            },
            fl_nota_fiscal_produtor: {
                value: '',
            },
            nota_fiscal_produtor: {
                value: '',
            },
            fl_agricultor_familiar: {
                value: '',
            },
            fl_agricultor_familiar_dap: {
                value: '',
            },
            agricultor_familiar_numero: {
                value: '',
            },
            agricultor_familiar_data: {
                value: '',
            },
            fl_assistencia_tecnica: {
                value: '',
            },
            assistencia_tecnica_tipo_id: {
                value: '',
            },
            assistencia_tecnica_periodo: {
                value: '',
            },
            fl_comunidade_tradicional: {
                value: '',
            },
            comunidade_tradicional_obs: {
                value: '',
            },
            fl_internet: {
                value: '',
            },
            fl_tipo_parceria: {
                value: '',
            },
            tipo_parcerias_obs: {
                value: '',
            },
            fl_reside_unidade_produtiva: {
                value: '',
            },
            cep: {
                value: '',
            },
            endereco: {
                value: '',
            },
            bairro: {
                value: '',
            },
            cidade_id: {
                value: '',
                validationRules: ['isRequired'],
            },
            estado_id: {
                value: '',
                validationRules: ['isRequired'],
            },
            renda_agricultura_id: {
                value: '',
            },
            rendimento_comercializacao_id: {
                value: '',
            },
            outras_fontes_renda: {
                value: '',
            },
            grau_instrucao_id: {
                value: '',
            },
        },
    },
    signals: {
        goStep: [set(state`produtor.step`, props`step`)],

        fetchProdutor: [
            async ({ db, props, state }) => {
                const [data] = await db.exec('SELECT * FROM produtores WHERE id=:id AND deleted_at IS NULL', [
                    props.produtorId,
                ]);
                if (data.rows.length > 0) {
                    const dataProdutor = data.rows.item(0);
                    dataProdutor.data_nascimento = dateToDisplay(dataProdutor.data_nascimento);
                    dataProdutor.agricultor_familiar_data = dateToDisplay(dataProdutor.agricultor_familiar_data);

                    setFormData('produtor.formCadastroBasico', dataProdutor, state);
                    setFormData('produtor.formProdutor', dataProdutor, state);

                    //Pessoas
                    const [
                        dataUnidadeProdutiva,
                    ] = await db.exec(
                        'SELECT * FROM produtor_unidade_produtiva where produtor_id = :id AND deleted_at IS NULL',
                        [dataProdutor.id]
                    );

                    dataUnidadeProdutiva.rows.raw().map((v, k) => {
                        const pathForm = 'produtor.formListUnidadeProdutiva.' + k;
                        state.set(pathForm, cloneDeep(emptyUnidadeProdutiva));
                        setFormData(pathForm, v, state);
                    });
                }
            },
        ],

        salvarCadastroBasico: [
            prepareFormCadastroBasico,
            async ({ db, forms, props, path }) => {
                const data = forms.toJSON('produtor.formCadastroBasico');

                const cpf = data.cpf.replace(/[^0-9]/g, '');

                if (cpf) {
                    const [
                        produtoresRet,
                    ] = await db.exec('select id, nome from produtores where cpf=:cpf and id != :id', [cpf, data.id]);

                    if (produtoresRet.rows.length > 0) {
                        const pr = produtoresRet.rows.item(0);
                        props.messageCpf =
                            'O produtor com CPF: ' + cpf + ' já existe. Nome do produtor encontrado: ' + pr.nome + '.';
                        //  +
                        // '. Código do produtor que contém o CPF informado: ' +
                        // pr.id;
                        return path.false();
                    } else {
                        return path.true();
                    }
                } else {
                    return path.true();
                }
            },
            {
                true: [
                    async ({ db, forms, props }) => {
                        let data = forms.toJSON('produtor.formCadastroBasico');
                        data.cpf = data.cpf.replace(/[^0-9]/g, '');

                        const ret = await db.insertOrUpdate('produtores', data);
                        props.id = ret.id;

                        if (data.id) {
                            props.message = 'Produtor/a atualizado com sucesso!';
                        } else {
                            props.message = 'Produtor/a criado com sucesso!';
                        }
                    },
                    set(state`produtor.step`, 1),

                    set(state`produtor.formCadastroBasico.id.value`, props`id`),
                    set(state`produtor.formProdutor.id.value`, props`id`),
                    ...createSyncFlow(false, true, false, false, false, false, false, false),
                    toast({ text: props`message`, type: 'info' }),
                ],
                false: [
                    // 'O CPF informado já foi utilizado'
                    modal({ title: 'Aviso', content: props`messageCpf` }, [{ path: 'ok', label: 'OK' }]),
                    {
                        ok: [],
                    },
                ],
            },
        ],

        salvarUnidadeProdutiva: [
            async ({ state, db, forms }) => {
                const produtor_id = state.get('produtor.formCadastroBasico.id.value');

                //Remove
                const listDeleted = state.get('produtor.formListUnidadeProdutivaDeleted');

                listDeleted.map((v) => {
                    db.deleteItem('produtor_unidade_produtiva', v);
                });

                //Adiciono
                const list = state.get('produtor.formListUnidadeProdutiva');

                let insertedUnidProdutivas = [];

                const promises = list.map((v, k) => {
                    if (!v) {
                        return null;
                    }

                    const formData = forms.toJSON('produtor.formListUnidadeProdutiva.' + k);

                    if (insertedUnidProdutivas.indexOf(formData.unidade_produtiva_id) > -1) {
                        //IGNORA REGISTRO
                        return null;
                    }

                    insertedUnidProdutivas.push(formData.unidade_produtiva_id);

                    return db.insertOrUpdate('produtor_unidade_produtiva', { produtor_id, ...formData });
                });

                //Atualiza IDS dos registros
                const results = await Promise.all(promises);
                results.map((v, k) => {
                    if (!v) {
                        return null;
                    }
                    state.set(`produtor.formListUnidadeProdutiva.${k}.id.value`, v.id);
                });
            },
            set(state`produtor.step`, 2),
            ...createSyncFlow(false, true, false, false, false, false, false, false),
            toast({ text: 'Produtor atualizado com sucesso!', type: 'info' }),
        ],

        salvarProdutor: [
            async ({ db, forms }) => {
                const data = forms.toJSON('produtor.formProdutor');

                data.data_nascimento = dateToSave(data.data_nascimento);
                data.agricultor_familiar_data = dateToSave(data.agricultor_familiar_data);

                const ret = await db.insertOrUpdate('produtores', data);

                if (isNaN(ret.id)) {
                    ActionRoute.go('/home');
                } else {
                    ActionRoute.go(`/produtor/${data.id}`);
                }
            },
            //Não precisa mais, porque a /home e o /produtor fazem o sync tb
            // ...createSyncFlow(false, true, false, false, false, false, false, false),
            toast({ text: 'Produtor atualizado com sucesso!', type: 'info' }),
        ],

        addUnidadeProdutiva: [addUnidadeProdutiva],
        deleteUnidadeProdutiva: [deleteUnidadeProdutiva],
        reset: [
            set(state`produtor.step`, 0),
            set(state`produtor.formListUnidadeProdutiva`, []),
            set(state`produtor.formListUnidadeProdutivaDeleted`, []),
            resetFormCustom(state`produtor.formCadastroBasico`),
            resetFormCustom(state`produtor.formProdutor`),
        ],
    },
});

function prepareFormCadastroBasico({ props, forms }) {
    const data = forms.toJSON('produtor.formCadastroBasico');
    props.variables = data;
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

function addUnidadeProdutiva({ state }) {
    const formList = state.get('produtor.formListUnidadeProdutiva');

    const length = formList.length;

    state.set('produtor.formListUnidadeProdutiva.' + length, cloneDeep(emptyUnidadeProdutiva));
}

async function deleteUnidadeProdutiva({ props, forms, state }) {
    const path = 'produtor.formListUnidadeProdutiva';
    const pathDeleted = 'produtor.formListUnidadeProdutivaDeleted';

    const { position } = props;

    const data = forms.toJSON(`${path}.${position}`);

    deleteFromList(path, pathDeleted, position, data, state);
}
