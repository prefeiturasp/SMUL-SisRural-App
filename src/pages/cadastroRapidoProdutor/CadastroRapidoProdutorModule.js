import { Module } from 'cerebral';
import { props, state } from 'cerebral/tags';
import { ActionRoute } from '../../components';
import { modal } from '../../modules/addons';
import { createSyncFlow } from '../../modules/DBModule';
import resetFormCustom from '../../modules/form/resetFormCustom';
import { toast } from '../../modules/ToastModule';
import { isDev } from '../../utils/AppUtil';

const reset = [
    resetFormCustom(state`cadastroRapidoProdutor.formCadastroBasico`),
    resetFormCustom(state`cadastroRapidoProdutor.formRelacao`),
    resetFormCustom(state`cadastroRapidoProdutor.formUnidadeProdutiva`),
];

export default Module({
    state: {
        formCadastroBasico: {
            nome: {
                value: isDev() ? 'teste' : '',
                validationRules: ['isRequired'],
                defaultValue: '',
            },
            cpf: {
                value: '',
                validationRules: ['isCpf'],
                defaultValue: '',
            },
            telefone_1: {
                value: '',
                defaultValue: '',
            },
            telefone_2: {
                value: '',
                defaultValue: '',
            },
        },

        formRelacao: {
            isRelacao: {
                value: isDev() ? true : false,
                defaultValue: false,
            },
            unidade_produtiva_id: {
                value: isDev() ? 1 : '',
                validationRules: ['isRequired'],
                defaultValue: '',
            },
            tipo_posse_id: {
                value: isDev() ? 1 : '',
                validationRules: ['isRequired'],
                defaultValue: '',
            },
        },

        formUnidadeProdutiva: {
            nome: {
                value: '',
                validationRules: ['isRequired'],
                defaultValue: '',
            },
            cep: {
                value: '',
                defaultValue: '',
            },
            endereco: {
                value: '',
                validationRules: ['isRequired'],
                defaultValue: '',
            },
            bairro: {
                value: '',
                defaultValue: '',
            },
            estado_id: {
                value: '',
                validationRules: ['isRequired'],
                defaultValue: '',
            },
            cidade_id: {
                value: '',
                validationRules: ['isRequired'],
                defaultValue: '',
            },
            lat: {
                value: '',
                // validationRules: ['isRequired'],
                defaultValue: '',
            },
            lng: {
                value: '',
                // validationRules: ['isRequired'],
                defaultValue: '',
            },
        },
    },
    signals: {
        reset: reset,
        save: [
            async ({ module, path, props, db }) => {
                let cpf = module.get('formCadastroBasico.cpf.value');
                cpf = cpf.replace(/[^0-9]/g, '');
                if (cpf.length > 1) {
                    const [produtoresRet] = await db.exec('select id, nome from produtores where cpf=:cpf', [cpf]);

                    if (produtoresRet.rows.length > 0) {
                        const pr = produtoresRet.rows.item(0);
                        props.messageCpf =
                            'O produtor com CPF: ' + cpf + ' já existe. Nome do produtor encontrado: ' + pr.nome + '.';
                        // +
                        // '. Código do produtor que contém o CPF informado: ' +
                        // pr.id;

                        return path.false();
                    }
                }
                return path.true();
            },
            {
                false: [
                    //'O CPF informado já foi utilizado'
                    modal({ title: 'Aviso', content: props`messageCpf` }, [{ path: 'ok', label: 'OK' }]),
                    {
                        ok: [],
                    },
                ],
                true: [
                    async ({ forms, module, state, db, props }) => {
                        let unidadeProdutivaId, produtorId;

                        const unidadeData = forms.toJSON('cadastroRapidoProdutor.formUnidadeProdutiva');
                        const relacaoData = forms.toJSON('cadastroRapidoProdutor.formRelacao');
                        const produtorData = forms.toJSON('cadastroRapidoProdutor.formCadastroBasico');
                        produtorData.cpf = produtorData.cpf.replace(/[^0-9]/g, '');

                        //fixa o estado/cidade no produtor
                        const isRelacao = relacaoData.isRelacao;

                        if (isRelacao) {
                            const [unidProdRef] = await db.exec('select * from unidade_produtivas where id=:id', [
                                relacaoData.unidade_produtiva_id,
                            ]);

                            produtorData.estado_id = unidProdRef.rows.item(0).estado_id;
                            produtorData.cidade_id = unidProdRef.rows.item(0).cidade_id;
                        } else {
                            produtorData.estado_id = unidadeData.estado_id;
                            produtorData.cidade_id = unidadeData.cidade_id;
                        }

                        const produtorRet = await db.insertOrUpdate('produtores', produtorData);
                        produtorId = produtorRet.id;

                        if (isRelacao) {
                            unidadeProdutivaId = relacaoData.unidade_produtiva_id;
                        } else {
                            unidadeData.owner_id = state.get('auth.user').id;
                            const unidadeRet = await db.insertOrUpdate('unidade_produtivas', unidadeData);
                            unidadeProdutivaId = unidadeRet.id;
                        }

                        //route
                        props.produtorId = produtorId;

                        await db.insertOrUpdate('produtor_unidade_produtiva', {
                            unidade_produtiva_id: unidadeProdutivaId,
                            produtor_id: produtorId,
                            tipo_posse_id: relacaoData.tipo_posse_id,
                        });
                    },
                    ...reset,
                    ...createSyncFlow(false, true, true, false, false, false, false, false),
                    ({ props }) => {
                        ActionRoute.replace('/produtor/' + props.produtorId);
                    },
                    toast({ text: 'Produtor criado com sucesso!', type: 'info' }),
                ],
            },
        ],
    },
});
