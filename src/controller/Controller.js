import { Controller, Module } from 'cerebral';
import Devtools from 'cerebral/devtools';
import { DEBUGGER } from 'react-native-dotenv';
import ModalModule from '../modules/addons/modal/ModalModule';
import AppModule from '../modules/AppModule';
import AuthModule from '../modules/AuthModule';
import ChecklistModule from '../modules/ChecklistModule';
import DBModule from '../modules/DBModule';
import FormModule from '../modules/FormModule';
import LoginModule from '../modules/LoginModule';
import OfflineModule from '../modules/OfflineModule';
import PlanoAcaoItemModule from '../modules/PlanoAcaoItemModule';
import PlanoAcaoModule from '../modules/PlanoAcaoModule';
import ProdutorModule from '../modules/ProdutorModule';
import DBProvider from '../modules/providers/DBProvider';
import FormsProvider from '../modules/providers/FormsProvider';
import HttpProvider from '../modules/providers/HttpProvider';
import RecuperarSenhaModule from '../modules/RecuperarSenhaModule';
import ToastModule from '../modules/ToastModule';
import UnidadeProdutivaModule from '../modules/UnidadeProdutivaModule';
import CadernoCampoModule from '../pages/cadastroCadernoCampo/CadernoCampoModule';
import CadastroRapidoProdutorModule from '../pages/cadastroRapidoProdutor/CadastroRapidoProdutorModule';
import HomePageModule from '../pages/home/HomePageModule';
import {
    decorateModuleCatch,
    decorateModuleSignals,
    onCompleteErrorHandler,
    onCompleteHandler,
} from '../utils/CerebralUtil';
import { errorHandlerFlow } from './ErrorHandler';

const modulesApp = Module({
    options: { strictRender: false },
    providers: {
        http: HttpProvider,
        forms: FormsProvider,
        db: DBProvider,
    },
    modules: {
        app: AppModule,
        form: FormModule,
        login: LoginModule,
        toast: ToastModule,
        auth: AuthModule,
        recuperarSenha: RecuperarSenhaModule,
        produtor: ProdutorModule,
        unidProdutiva: UnidadeProdutivaModule,
        db: DBModule,
        modal: ModalModule,
        offline: OfflineModule,
        homePage: HomePageModule,
        cadernoCampo: CadernoCampoModule,
        cadastroRapidoProdutor: CadastroRapidoProdutorModule,
        checklist: ChecklistModule,
        planoAcao: PlanoAcaoModule,
        planoAcaoItem: PlanoAcaoItemModule,
    },
    catch: [[Error, errorHandlerFlow]],
});

const controller = Controller(modulesApp, {
    devtools:
        __DEV__ && process.env.NODE_ENV !== 'test' && DEBUGGER
            ? Devtools({
                  host: DEBUGGER,
                  reconnect: true,
                  bigComponentsWarning: 15,
              })
            : null,
});

decorateModuleSignals(controller.module, onCompleteHandler);
decorateModuleCatch(controller.module, onCompleteErrorHandler);

// controller.module.modules.app.signals.initApp.signal.push(() => {
//     alert('funcionou');
// });

export default controller;
