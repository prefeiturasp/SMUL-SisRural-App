import { form } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';
import { HeaderMenu, Loading, Spacer, TabViewMaterial } from '../../components';
import Theme from '../../Theme';
import AguaSubpage from './aguaSubpage/AguaSubpage';
import ArquivosSubpage from './arquivosSubpage/ArquivosSubpage';
import ComercializacaoSubpage from './comercializacaoSubpage/ComercializacaoSubpage';
import DadosBasicosSubpage from './dadosBasicosSubpage/DadosBasicosSubpage';
import DadosComplementaresSubpage from './dadosComplementaresSubpage/DadosComplementaresSubpage';
import InfraEstruturaSubpage from './infraEstruturaSubpage/InfraEstruturaSubpage';
import PessoasSubpage from './pessoasSubpage/PessoasSubpage';
import PressaoSocialSubpage from './pressaoSocialSubpage/PressaoSocialSubpage';
import UsoSoloSubpage from './usoSoloSubpage/UsoSoloSubpage';

const styles = {
    root: {
        flex: 1,
    },
    scrollview: {
        flexGrow: 1,
    },
};

class CadastroUnidadeProdutivaPage extends React.PureComponent {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { unidadeProdutivaId, produtorId } = this.props.match.params;

        if (!unidadeProdutivaId && !produtorId) {
            throw Error('Unidade Produtiva ou Produtor obrigatório!');
        }

        //Carrega somente se nao tiver dados
        if (unidadeProdutivaId && unidadeProdutivaId !== '0') {
            this.props.signalFetchUnidProdutiva({ unidadeProdutivaId });
        }
    }

    componentWillUnmount() {
        this.props.signalReset();
    }

    getRoutesMemo = _.memoize(id => {
        return [
            {
                key: 'dados_basicos',
                title: 'DADOS BÁSICOS',
                produtorId: this.props.match.params.produtorId,
            },
            {
                key: 'dados_complementares',
                title: 'DADOS COMPLEMENTARES',
                disabled: !id,
            },
            {
                key: 'uso_do_solo', //5 -> 2
                title: 'USO DO SOLO',
                disabled: !id,
            },
            {
                key: 'comercializacao',
                title: 'COMERCIALIZAÇÃO',
                disabled: !id,
            },
            {
                key: 'agua',
                title: 'SANEAMENTO RURAL',
                disabled: !id,
            },
            {
                key: 'pessoas',
                title: 'PESSOAS',
                disabled: !id,
            },
            {
                key: 'infra_estrutura',
                title: 'INFRA-ESTRUTURA',
                disabled: !id,
            },
            {
                key: 'pressoes_sociais', //2 -> 7
                title: 'PRESSÕES SOCIAIS',
                disabled: !id,
            },
            {
                key: 'arquivos',
                title: 'ARQUIVOS',
            },
        ];
    });

    getRoutes = () => {
        const { unidadeProdutivaId } = this.props;

        const id = unidadeProdutivaId.value;

        return this.getRoutesMemo(id);
    };

    render() {
        const { loading } = this.props;

        const renderScene = ({ route }) => {
            switch (route.key) {
                case 'dados_basicos':
                    return <DadosBasicosSubpage produtorId={this.props.match.params.produtorId} />;
                case 'dados_complementares':
                    return <DadosComplementaresSubpage />;
                case 'pressoes_sociais':
                    return <PressaoSocialSubpage />;
                case 'comercializacao':
                    return <ComercializacaoSubpage />;
                case 'agua':
                    return <AguaSubpage />;
                case 'uso_do_solo':
                    return <UsoSoloSubpage />;
                case 'pessoas':
                    return <PessoasSubpage />;
                case 'infra_estrutura':
                    return <InfraEstruturaSubpage />;
                case 'arquivos':
                    return <ArquivosSubpage />;
                default:
                    return null;
            }
        };

        // const renderScene = SceneMap({
        //     dados_basicos: DadosBasicosSubpage,
        //     dados_complementares: DadosComplementaresSubpage,
        //     pressoes_sociais: PressaoSocialSubpage,
        //     comercializacao: ComercializacaoSubpage,
        //     agua: AguaSubpage,
        //     uso_do_solo: UsoSoloSubpage,
        //     pessoas: PessoasSubpage,
        //     infra_estrutura: InfraEstruturaSubpage,
        //     arquivos: ArquivosSubpage,
        // });

        return (
            <View style={styles.root}>
                <HeaderMenu title="Unidade Produtiva" />

                {loading && (
                    <Spacer vertical={2}>
                        <Loading color={Theme.colors.teal} />
                    </Spacer>
                )}

                {!loading && (
                    <TabViewMaterial
                        lazy
                        navigationState={{ index: this.props.step, routes: this.getRoutes() }}
                        renderScene={renderScene}
                        onIndexChange={v => {
                            //TODO validação aqui
                            //Pela posição/step pegar qual o "data/formdata" foi modificado ... se continua ou não
                            //No fetch dos dados iniciais, fazer uma cópia dos dados?
                            this.props.signalGoStep({ step: v });
                        }}
                    />
                )}
            </View>
        );
    }
}

export default connect(
    {
        signalFetchUnidProdutiva: signal`unidProdutiva.fetchUnidProdutiva`,

        signalGoStep: signal`unidProdutiva.goStep`,
        step: state`unidProdutiva.step`,
        loading: state`unidProdutiva.loading`,

        signalReset: signal`unidProdutiva.reset`,

        unidadeProdutivaId: form(state`unidProdutiva.formDadosBasicos.id`),
    },
    CadastroUnidadeProdutivaPage
);
