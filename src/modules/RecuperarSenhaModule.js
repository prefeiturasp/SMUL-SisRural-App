import { Module } from 'cerebral';
import { props as Props, state } from 'cerebral/tags';
import { ActionRoute } from '../components';
import { isDev } from '../utils/AppUtil';
import resetFormCustom from './form/resetFormCustom';
import { APIResponse, post } from './services';
import { toast, toastErrorRequest } from './ToastModule';

export default Module({
    state: {
        form: {
            cpf: {
                value: isDev() ? '00836115090' : '',
                validationRules: ['isRequired', 'isCpf'],
                customErrorMessage: 'Digite um CPF válido',
            },
        },

        requestRecuperar: APIResponse(),
    },
    signals: {
        recuperar: [
            prepareRecuperar,
            ...post('/auth/forgot', 'recuperarSenha.requestRecuperar', Props`variables`),
            {
                success: [
                    resetFormCustom(state`recuperarSenha.form`),
                    toast({ text: 'Um link de redefinição foi enviado para o seu e-mail', type: 'info' }),
                    () => {
                        ActionRoute.replace('/login');
                    },
                ],
                error: [toastErrorRequest({ path: 'recuperarSenha.requestRecuperar' })],
            },
        ],
    },
});

function prepareRecuperar({ props, forms }) {
    const data = forms.toJSON('recuperarSenha.form');

    props.variables = {
        document: data.cpf,
    };
}
