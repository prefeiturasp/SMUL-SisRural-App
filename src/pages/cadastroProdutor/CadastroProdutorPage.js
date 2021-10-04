import { form } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { SceneMap } from 'react-native-tab-view';
import { HeaderMenu, TabViewMaterial } from '../../components';
import CadastroBasicoSubpage from './cadastroBasicoSubpage/CadastroBasicoSubpage';
import DadosComplementaresSubpage from './dadosComplementaresSubpage/DadosComplementaresSubpage';
import UnidadesProdutivasSubpage from './unidadesProdutivasSubpage/UnidadesProdutivasSubpage';
import { memoize } from 'lodash';

class CadastroProdutorPage extends React.Component {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { produtorId } = this.props.match.params;

        if (produtorId) {
            this.props.signalFetchProdutor({ produtorId });
        }
    }

    componentWillUnmount() {
        this.props.signalReset();
    }

    getRoutesMemo = memoize(value => {
        return [
            {
                key: 'dadosBasico',
                title: 'DADOS BÁSICOS',
            },
            {
                key: 'unidadesProdutivas',
                title: 'UNIDADE(S) PRODUTIVA(S)',
                disabled: !value,
            },
            {
                key: 'dadosComplementares',
                title: 'DADOS COMPLEMENTARES',
                disabled: !value,
            },
        ];
    });

    getRoutes = () => {
        const { produtorId } = this.props;
        return this.getRoutesMemo(produtorId.value);
    };

    render() {
        const renderScene = SceneMap({
            dadosBasico: CadastroBasicoSubpage,
            unidadesProdutivas: UnidadesProdutivasSubpage,
            dadosComplementares: DadosComplementaresSubpage,
        });

        return (
            <React.Fragment>
                <HeaderMenu title="Dados do Produtor/a" />

                <TabViewMaterial
                    lazy
                    navigationState={{ index: this.props.step, routes: this.getRoutes() }}
                    renderScene={renderScene}
                    onIndexChange={v => {
                        this.props.signalGoStep({ step: v });
                    }}
                />
            </React.Fragment>
        );
    }
}

export default connect(
    {
        signalReset: signal`produtor.reset`,

        signalGoStep: signal`produtor.goStep`,
        step: state`produtor.step`,

        signalFetchProdutor: signal`produtor.fetchProdutor`,
        produtorId: form(state`produtor.formCadastroBasico.id`),
    },
    CadastroProdutorPage
);
