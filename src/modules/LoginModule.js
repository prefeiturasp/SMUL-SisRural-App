import { Module } from 'cerebral';
import { set, when } from 'cerebral/operators';
import { props, state } from 'cerebral/tags';
import { ActionRoute } from '../components';
import { DBMigrator } from '../db/Db';
import { requestPermissionsFlow } from '../pages/cadastroCadernoCampo/CadernoCampoModule';
import DadosGeraisDownload from '../sync/DadosGeraisDownload';
import { isDev } from '../utils/AppUtil';
import { modal } from './addons';
import { getDeviceToken } from './auth';
import { flowAuthUser } from './AuthModule';
import { flowRunMigrations } from './DBModule';
import { offlineCheckFlow } from './OfflineModule';
import { APIResponse, post } from './services';
import { toastErrorRequest } from './ToastModule';

const termsPress = [
    async ({ db }) => {
        const migrator = new DBMigrator(db);
        const hasTermos = await migrator.hasTable('termos_de_usos');
        return { hasTermos };
    },
    when(props`hasTermos`),
    {
        true: [
            () => {
                ActionRoute.go('/termosUso');
            },
        ],
        false: [
            ...offlineCheckFlow,
            when(state`offline.isOnline`),
            {
                true: [
                    ...flowRunMigrations,
                    async ctx => DadosGeraisDownload(ctx),
                    () => {
                        ActionRoute.go('/termosUso');
                    },
                ],
                false: [
                    modal({
                        title: 'Erro de conexão',
                        content: 'Não foi possível conectar ao servidor, verifique sua conexão.',
                    }),
                ],
            },
        ],
    },
];

export default Module({
    state: {
        formLogin: {
            cpf: {
                defaultValue: isDev() ? '57593537056' : '',
                value: isDev() ? '57593537056' : '',
                validationRules: ['isRequired', 'isCpf'],
                customErrorMessage: 'Digite um CPF válido',
            },
            password: {
                defaultValue: isDev() ? 'secret' : '',
                value: isDev() ? 'secret' : '',
                validationRules: ['isRequired', 'minLength:6'],
                customErrorMessage: 'Digite sua senha',
            },
            id: {
                defaultValue: isDev() ? '5' : '',
                value: isDev() ? '5' : '',
            },
        },

        requestLogin: APIResponse(),
        requestFetchRoles: APIResponse(),
    },
    signals: {
        termsPress,
        login: [
            getDeviceToken,
            prepareLogin,
            ...post('/auth/login', 'login.requestLogin', props`variables`),
            {
                success: [
                    ...requestPermissionsFlow,
                    set(state`login.requestLogin.loading`, true),
                    ...flowAuthUser,
                    set(state`login.requestLogin.loading`, false),
                ],
                error: [toastErrorRequest({ path: 'login.requestLogin' })],
            },
        ],
        fetchRoles: [
            prepareFetchRoles,
            ...post('/auth/document_roles', 'login.requestFetchRoles', props`variables`),
            {
                success: [
                    ({ state }) => {
                        const data = state.get('login.requestFetchRoles.result');
                        if (data && data.roles && data.roles.length > 0) {
                            state.set('login.formLogin.id.value', data.roles[0].id);
                        } else {
                            state.set('login.formLogin.id.value', null);
                        }
                    },
                ],
                error: [toastErrorRequest({ path: 'login.requestFetchRoles' })],
            },
        ],
    },
});

function prepareLogin({ props, forms }) {
    const data = forms.toJSON('login.formLogin');

    props.variables = {
        id: data.id,
        document: data.cpf,
        password: data.password,
        remember_me: true,
    };
}

function prepareFetchRoles({ props, forms }) {
    const data = forms.toJSON('login.formLogin');

    props.variables = {
        document: data.cpf,
    };
}
