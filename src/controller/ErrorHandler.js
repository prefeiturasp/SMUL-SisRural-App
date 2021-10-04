import { ActionRoute } from '../components';
import { hideAllLoading, modal } from '../modules/addons/modal/ModalModule';

export class ErrorRedirectHome extends Error {
    constructor(message) {
        super(message);
        this.name = 'ErrorRedirectHome';
    }
}

export const errorHandlerFlow = [
    hideAllLoading(),
    async ctx => {
        const { props } = ctx;
        const error = props.error;

        await modal(
            {
                title: 'Erro',
                content: formatMessage(getMessage(error)),
            },
            [
                {
                    label: 'Continuar',
                    path: 'continue',
                },
            ]
        )(ctx, true);

        if (error.name === 'ErrorRedirectHome') {
            ActionRoute.go('/home');
        } else if (error.name === 'HttpProviderError' && error.response && error.response.status === 401) {
            ctx.controller.getSignal('auth.logoutSilent')();
        } else {
            ActionRoute.go('syncError');
        }
    },
];

const formatMessage = str => {
    return str.split('<br/>').join('\n');
};

const getMessage = error => {
    if (error.response && error.response.result && error.response.result.message) {
        return error.response.result.message;
    }

    return error.message;
};
