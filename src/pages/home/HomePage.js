import { connect } from '@cerebral/react';
import { signal } from 'cerebral/tags';
import React from 'react';
import { ScrollView, View } from 'react-native';
import {
    ActionRoute,
    CardAdd,
    CardSearch,
    CardSearchEmpty,
    HeaderMenu,
    QueryDb,
    Spacer,
    TextInputSearch,
    Touchable,
    ViewSmart,
} from '../../components';
import { makePromise } from '../../utils/CerebralUtil';
import styles from './HomePage.styles';

class HomePage extends React.Component {
    static propTypes = {};

    state = { checklistCache: 0 };

    constructor(props) {
        super(props);
    }

    onSearchPress = () => {
        ActionRoute.go('/buscaProdutor');
    };

    onCadernoPress = () => {
        ActionRoute.go('/buscaCadernoCampo', {});
    };

    onNovoCadernoPress = () => {
        ActionRoute.go('/buscaProdutorRedirect/caderno');
    };

    onNovoChecklistPress = () => {
        ActionRoute.go('/buscaProdutorRedirect/checklist');
    };

    onProdutoresPress = () => {
        ActionRoute.go('/buscaProdutor');
    };

    onNovoProdutorPress = () => {
        ActionRoute.go('/cadastroRapidoProdutor');
    };

    onChecklistPress = () => {
        ActionRoute.go('/buscaChecklist');
    };

    onPlanoDeAcaoPress = tipo => {
        ActionRoute.go(`/buscaPlanoAcao/${tipo}`);
    };

    onNovoPlanoAcaoPress = () => {
        ActionRoute.go('/buscaProdutorRedirect/plano-acao');
    };

    onNovoPlanoAcaoChecklistPress = () => {
        ActionRoute.go('/buscaChecklistRedirect/plano-acao');
    };

    onNovoPlanoAcaoColetivoPress = () => {
        ActionRoute.go('/planoAcao');
    };

    componentDidMount() {
        const { promise, id } = makePromise();
        this.props.signalPageLoad({ onComplete: id });

        promise.then(() => {
            this.setState({
                checklistCache: this.state.checklistCache + 1,
            });
        });
    }

    render() {
        return (
            <View style={styles.root}>
                <HeaderMenu showLogo={true} />

                <ScrollView contentContainerStyle={styles.scrollview}>
                    <Spacer horizontal={3}>
                        <Touchable onPress={this.onSearchPress}>
                            <View pointerEvents="none">
                                <TextInputSearch placeholder="Pesquisar Produtor ou Unidade Produtiva" />
                            </View>
                        </Touchable>

                        <Spacer vertical={2} />

                        <ViewSmart row alignCenter justifyCenter flexWrap>
                            <QueryDb
                                query={'select count(cadernos.id) as total from cadernos where deleted_at is null'}
                            >
                                {data => {
                                    return (
                                        <CardSearch
                                            label="Ir para busca de cadernos de campo"
                                            title={'Cadernos de campo'}
                                            subtitle={data[0].total}
                                            onPress={this.onCadernoPress}
                                            icon={'iconimage@caderno'}
                                        />
                                    );
                                }}
                            </QueryDb>

                            <CardAdd
                                title={'Novo Caderno de Campo'}
                                subtitle={'CRIAR'}
                                onPress={this.onNovoCadernoPress}
                                icon={'iconimage@caderno'}
                            />

                            <QueryDb
                                query={'select count(produtores.id) as total from produtores where deleted_at is null'}
                            >
                                {data => {
                                    return (
                                        <CardSearch
                                            label="Ir para busca de produtores"
                                            title={'Produtores'}
                                            subtitle={data[0].total}
                                            onPress={this.onProdutoresPress}
                                            icon={'iconimage@produtor'}
                                        />
                                    );
                                }}
                            </QueryDb>

                            <CardAdd
                                label="Novo produtor"
                                title={'Novo Produtor/a'}
                                subtitle={'CRIAR'}
                                onPress={this.onNovoProdutorPress}
                                icon={'iconimage@produtor'}
                            />

                            <QueryDb
                                key={this.state.checklistCache}
                                query={`select count(*) as total 
                                    from 
                                    checklist_unidade_produtivas CUP, produtores P,unidade_produtivas UP
                                    where 
                                    CUP.deleted_at is null and
                                    CUP.produtor_id = P.id and
                                    CUP.unidade_produtiva_id = UP.id
                                    `}
                            >
                                {data => {
                                    return (
                                        <CardSearch
                                            label="Ir para busca de formulários"
                                            title={'Formulários'}
                                            subtitle={data[0].total}
                                            onPress={this.onChecklistPress}
                                            icon={'iconimage@caderno'}
                                        />
                                    );
                                }}
                            </QueryDb>

                            <CardAdd
                                title={'Aplicar formulário'}
                                subtitle={''}
                                onPress={this.onNovoChecklistPress}
                                icon={'iconimage@caderno'}
                            />

                            <QueryDb
                                query={`select count(*) as total 
                                    from 
                                    plano_acoes PA, produtores P, unidade_produtivas UP
                                    where 
                                    PA.fl_coletivo = 0 and
                                    PA.deleted_at is null and 
                                    P.id = PA.produtor_id and
                                    UP.id = PA.unidade_produtiva_id
                                    `}
                            >
                                {data => {
                                    return (
                                        <CardSearch
                                            label="Ir para busca de planos de ação"
                                            title={'Planos de Ação'}
                                            subtitle={data[0].total}
                                            onPress={this.onPlanoDeAcaoPress.bind(this, 'individual')}
                                            icon={'iconimage@planoAcao'}
                                        />
                                    );
                                }}
                            </QueryDb>

                            <CardAdd
                                title={'Novo Plano de Ação'}
                                subtitle={''}
                                onPress={this.onNovoPlanoAcaoPress}
                                icon={'iconimage@planoAcao'}
                            />

                            <QueryDb
                                query={`select count(*) as total 
                                    from 
                                    plano_acoes PA
                                    where 
                                    PA.fl_coletivo = 1 and
                                    PA.plano_acao_coletivo_id is null and
                                    PA.deleted_at is null
                                    `}
                            >
                                {data => {
                                    return (
                                        <CardSearch
                                            label="Ir para busca de Planos de Ação Coletivos"
                                            title={'Planos de Ação Coletivo'}
                                            subtitle={data[0].total}
                                            onPress={this.onPlanoDeAcaoPress.bind(this, 'coletivo')}
                                            icon={'iconimage@planoAcao'}
                                        />
                                    );
                                }}
                            </QueryDb>

                            <CardAdd
                                title={'Novo Plano de Ação Coletivo'}
                                subtitle={''}
                                onPress={this.onNovoPlanoAcaoColetivoPress}
                                icon={'iconimage@planoAcao'}
                            />

                            <CardSearchEmpty />

                            <CardAdd
                                title={'Novo Plano de Ação - Formulário'}
                                subtitle={''}
                                onPress={this.onNovoPlanoAcaoChecklistPress}
                                icon={'iconimage@planoAcao'}
                            />
                        </ViewSmart>

                        <Spacer vertical={4} />
                    </Spacer>
                </ScrollView>
            </View>
        );
    }
}

export default connect(
    {
        signalPageLoad: signal`homePage.pageLoad`,
    },
    HomePage
);
