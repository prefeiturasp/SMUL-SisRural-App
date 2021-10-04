import { connect } from '@cerebral/react';
import { state } from 'cerebral/tags';
import React from 'react';
import { Route, Switch } from 'react-router-native';
import { ToastTop } from './components';
import BuscaCadernoCampoPage from './pages/buscaCadernoCampo/BuscaCadernoCampoPage';
import BuscaFormularioChecklistRedirectPage from './pages/buscaFormularioChecklistRedirect/BuscaFormularioChecklistRedirectPage';
import BuscaProdutorPage from './pages/buscaProdutor/BuscaProdutorPage';
import BuscaProdutorRedirectPage from './pages/buscaProdutorRedirect/BuscaProdutorRedirectPage';
import BuscaUnidadeProdutivaInvalidasPage from './pages/buscaUnidadeProdutivaInvalidas/BuscaUnidadeProdutivaInvalidasPage';
import BuscaUnidadeProdutivaRedirectPage from './pages/buscaUnidadeProdutivaRedirect/BuscaUnidadeProdutivaRedirectPage';
import CadastroCadernoCampoPage from './pages/cadastroCadernoCampo/CadastroCadernoCampoPage';
import NovaFotoPage from './pages/cadastroCadernoCampo/novaFotoPage/NovaFotoPage';
import CadastroChecklistPage from './pages/cadastroChecklist/CadastroChecklistPage';
import CadastroProdutorPage from './pages/cadastroProdutor/CadastroProdutorPage';
import CadastroRapidoProdutorPage from './pages/cadastroRapidoProdutor/CadastroRapidoProdutorPage';
import CadastroUnidadeProdutivaPage from './pages/cadastroUnidadeProdutiva/CadastroUnidadeProdutivaPage';
import ArquivosChecklistPage from './pages/checklist/arquivosChecklist/ArquivosChecklistPage';
import BuscaChecklistPage from './pages/checklist/buscaChecklist/BuscaChecklistPage';
import FillChecklistPage from './pages/checklist/fillChecklist/FillChecklistPage';
import OverviewChecklistPage from './pages/checklist/overviewChecklist/OverviewChecklistPage';
import FaleConoscoPage from './pages/faleConosco/FaleConoscoPage';
import HomePage from './pages/home/HomePage';
import InitPage from './pages/init/InitPage';
import LoginPage from './pages/login/LoginPage';
import BuscaPlanoAcaoPage from './pages/planoAcao/buscaPlanoAcao/BuscaPlanoAcaoPage';
import DadosPlanoAcaoPage from './pages/planoAcao/dadosPlanoAcao/DadosPlanoAcaoPage';
import DadosPlanoAcaoItemPage from './pages/planoAcao/dadosPlanoAcaoItem/DadosPlanoAcaoItemPage';
import ProdutorPage from './pages/produtor/ProdutorPage';
import ProdutorCadernoCampoPage from './pages/produtorCadernoCampo/ProdutorCadernoCampoPage';
import RecuperarSenhaPage from './pages/recuperarSenha/RecuperarSenhaPage';
import SyncErrorPage from './pages/syncError/SyncErrorPage';
import TermosUsoPage from './pages/termosUso/TermosUsoPage';

export default class Routes extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <React.Fragment>
                <Switch>
                    <Route exact path="/" component={InitPage} />
                    <Route path="/home" component={HomePage} />
                    <Route path="/login" component={LoginPage} />
                    <Route path="/produtor/:produtorId" component={ProdutorPage} exact />
                    <Route path="/cadastroRapidoProdutor" component={CadastroRapidoProdutorPage} exact />
                    <Route path="/cadastroProdutor" component={CadastroProdutorPage} exact />
                    <Route path="/cadastroProdutor/:produtorId" component={CadastroProdutorPage} />
                    <Route path="/cadastroUnidadeProdutiva" component={CadastroUnidadeProdutivaPage} exact />
                    <Route
                        path="/cadastroUnidadeProdutiva/:unidadeProdutivaId/:produtorId"
                        component={CadastroUnidadeProdutivaPage}
                        exact
                    />
                    <Route
                        path="/cadastroUnidadeProdutiva/:unidadeProdutivaId/:produtorId"
                        component={CadastroUnidadeProdutivaPage}
                        exact
                    />
                    <Route
                        path="/cadastroCadernoCampo/:unidadeProdutivaId/:produtorId"
                        component={CadastroCadernoCampoPage}
                        exact
                    />
                    <Route
                        path="/cadastroChecklist/:checklistId/:unidadeProdutivaId/:produtorId"
                        component={CadastroChecklistPage}
                        exact
                    />
                    <Route
                        path="/buscaFormularioChecklistRedirect/:tipo/:unidadeProdutivaId/:produtorId"
                        component={BuscaFormularioChecklistRedirectPage}
                        exact
                    />

                    <Route path="/buscaChecklist" exact component={BuscaChecklistPage} />
                    <Route path="/buscaChecklistRedirect/:tipo" exact component={BuscaChecklistPage} />

                    <Route path="/editarCadernoCampo/novaFoto" component={NovaFotoPage} exact />
                    <Route path="/editarCadernoCampo/:cadernoCampoId/" component={CadastroCadernoCampoPage} exact />
                    <Route path="/termosUso" component={TermosUsoPage} />
                    <Route path="/recuperarSenha" component={RecuperarSenhaPage} />
                    <Route path="/buscaCadernoCampo" component={BuscaCadernoCampoPage} />
                    <Route path="/buscaUnidadeProdutivaInvalidas" component={BuscaUnidadeProdutivaInvalidasPage} />

                    <Route path="/buscaProdutorRedirect/:tipo/" component={BuscaProdutorRedirectPage} exact />
                    <Route path="/buscaProdutorRedirect/:tipo/:param" component={BuscaProdutorRedirectPage} />

                    <Route path="/buscaProdutor" component={BuscaProdutorPage} />

                    <Route path="/buscaUnidadeProdutivaRedirect/:tipo" component={BuscaUnidadeProdutivaRedirectPage} />
                    <Route path="/editarChecklist/:checklistUnidadeProdutiva" component={OverviewChecklistPage} />
                    <Route path="/arquivosChecklist/:checklistUnidadeProdutiva" component={ArquivosChecklistPage} />

                    <Route path="/buscaPlanoAcao/:tipo" component={BuscaPlanoAcaoPage} />
                    {/* Edição PDA - qualquer */}
                    <Route path="/planoAcao/:planoAcaoId" component={DadosPlanoAcaoPage} exact />
                    {/* Cadastro PDA Coletivo */}
                    <Route path="/planoAcao/" component={DadosPlanoAcaoPage} exact />
                    {/* Cadastro PDA Individual ou adicionar Unidade/Produtor em um PDA Coletivo (informa o ID do plano coletivo no state) - ver BuscaProdutorRedirectPage */}
                    <Route path="/planoAcao/:unidadeProdutivaId/:produtorId" component={DadosPlanoAcaoPage} exact />
                    {/* Cadastro PDA Checklist */}
                    <Route
                        path="/planoAcao/:unidadeProdutivaId/:produtorId/:checklistUnidadeProdutivaId"
                        component={DadosPlanoAcaoPage}
                        exact
                    />
                    <Route path="/planoAcaoItem/:planoAcaoId" component={DadosPlanoAcaoItemPage} exact />
                    <Route path="/planoAcaoItem/:planoAcaoId/:planoAcaoItemId" component={DadosPlanoAcaoItemPage} />
                    <Route
                        path="/fillChecklist/:checklistUnidadeProdutiva/:checklistCategoria"
                        component={FillChecklistPage}
                    />
                    <Route path="/produtorCadernoCampo/:produtorId" component={ProdutorCadernoCampoPage} />
                    <Route path="/faleConosco" component={FaleConoscoPage} />
                    <Route path="/syncError" component={SyncErrorPage} />
                </Switch>
                <ConnectExtraComponents />
            </React.Fragment>
        );
    }
}

function ExtraComponents(props) {
    const { listToast } = props;

    return listToast.map((v) => {
        return <ToastTop key={v.id} id={v.id} type={v.type} visible={v.visible} text={v.text} />;
    });
}

const ConnectExtraComponents = connect(
    {
        listToast: state`toast.list`,
    },
    ExtraComponents
);
