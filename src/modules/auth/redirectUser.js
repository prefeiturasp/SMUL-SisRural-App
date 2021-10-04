import { ActionRoute } from '../../components';
import { Linking } from 'react-native';
import { isDev } from '../../utils/AppUtil';

const debug = require('debug')('redirectUser');

export default async ({ state, props }) => {
    const user = state.get('auth.user');

    if (user) {
        if (isDev()) {
            ActionRoute.replace('/home');
            // ActionRoute.go(`/editarCadernoCampo/1`);
            // ActionRoute.go(`/editarCadernoCampo/58a5fc8e-a048-4f00-ab1d-cedd7c8836c8`);

            // ActionRoute.go('/buscaCadernoCampo');

            //ActionRoute.go('/editarChecklist/6304e204-5328-4cf1-918e-91ffe7fcf0d2');
            // ActionRoute.go('/arquivosChecklist/829c1e34-4642-4592-aff4-c51f09691119');
            // ActionRoute.go('/fillChecklist/829c1e34-4642-4592-aff4-c51f09691119/51');

            // ActionRoute.replace('/cadastroRapidoProdutor');
            // ActionRoute.go('/buscaProdutorRedirect/produtor');
            // ActionRoute.go('/buscaChecklist');
            // ActionRoute.replace('/editarCadernoCampo/58a5fc8e-a048-4f00-ab1d-cedd7c8836c8');

            // ActionRoute.replace('/editarCadernoCampo/1796402c-97f7-4700-a1c7-1bc8f2537f29');

            // ActionRoute.go('/fillChecklist/4d7c0ac6-a158-422b-886c-f7a822c93b8c/5');
            // ActionRoute.go('/editarChecklist/9cd81b3e-00ba-4306-a6dd-0388baa57f2a');
            //ActionRoute.go('/fillChecklist/2d8fd844-9b60-4cd6-8320-1733cd6b584f/5');
            // ActionRoute.go('/fillChecklist/2c961b32-c174-49de-9443-126dc68c8e89/1');
            // ActionRoute.go('/planoAcao/app_cc3a7910-d5c1-11ea-82d2-4966c5d486cd');
            // ActionRoute.go('/buscaChecklist')c;
            // const ob = null;
            // ActionRoute.go('/produtor/1');
            // ActionRoute.go('/cadastroCadernoCampo/1/1');
            // ActionRoute.go('/login');

            // ActionRoute.go('/cadastroProdutor/1');

            // ActionRoute.go('/termosUso');
            // ActionRoute.go('/cadastroUnidadeProdutiva');
            // ActionRoute.go('/cadastroUnidadeProdutiva/1/1');
            // ActionRoute.go('/termosUso');
            // ActionRoute.go('/recuperarSenha');
            // ActionRoute.go('/faleConosco');
        } else {
            ActionRoute.replace('/home');
        }

        //deeplink
        const urlShare = await Linking.getInitialURL();
        if (urlShare) {
            handleDeeplink(urlShare);
        }

        ActionRoute.reset();
    } else {
        ActionRoute.replace('/login');
    }
};

Linking.addEventListener('url', (evt) => {
    handleDeeplink(evt.url);
});

function handleDeeplink(url) {
    debug('deeplink ' + url);
}
