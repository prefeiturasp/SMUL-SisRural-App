import { connect } from '@cerebral/react';
import { signal } from 'cerebral/tags';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { FlatList, InteractionManager, View } from 'react-native';
import {
    ActionRoute,
    Empty,
    HeaderMenu,
    ItemListProfile,
    LoadingMore,
    QueryDb,
    Separator,
    Spacer,
    TextInputSearch,
} from '../../components';
import { makePromise } from '../../utils/CerebralUtil';
import { letters } from '../../utils/StringUtil';
import styles from './BuscaProdutorRedirectPage.styles';

const LIMIT_QUERY = 20;

const QUERY = `
select 
	P.id as "produtores.id",
	P.nome as "produtores.nome",
	P.telefone_1 as "telefone_1",
	P.cpf as "cpf",
	P.cnpj as "cnpj",
	UP.id as "unidade_produtivas.id", 
	UP.nome as "unidade_produtivas.nome",
	UP.socios as "unidade_produtivas.socios"
from produtores P 
	 LEFT JOIN produtor_unidade_produtiva PUP on P.id = PUP.produtor_id
	 LEFT JOIN unidade_produtivas UP on UP.id = PUP.unidade_produtiva_id
WHERE
	(
        P.nome like :pnome
        OR
        UP.nome like :upnome
        OR
        UP.socios like :upsocios
        OR
        P.cpf like :cpf
        OR
        P.cnpj like :cnpj
    )
    AND 
    (
        P.deleted_at IS NULL AND
        PUP.deleted_at IS NULL AND
        UP.deleted_at IS NULL 
    )

LIMIT ${LIMIT_QUERY}
`;

//ORDER BY P.nome COLLATE NOCASE ASC

class BuscaProdutorRedirectPage extends React.Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                tipo: PropTypes.oneOf(['caderno', 'plano-acao', 'plano-acao-coletivo', 'checklist', 'produtor']),
            }),
        }),
    };

    state = {
        query: '',
        loading: true,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { promise, id } = makePromise();

        this.props.signalSync({ onComplete: id });

        promise.then(data => {
            this.setState({ loading: false });
        });
    }

    keyExtractor = (item, index) => {
        return index.toString();
    };

    onItemPress = item => {
        const {
            match: {
                params: { tipo, param },
            },
        } = this.props;

        switch (tipo) {
            case 'caderno':
                ActionRoute.go(`/cadastroCadernoCampo/${item['unidade_produtivas.id']}/${item['produtores.id']}`);
                break;
            case 'plano-acao':
                ActionRoute.go(`/planoAcao/${item['unidade_produtivas.id']}/${item['produtores.id']}`);
                break;
            case 'plano-acao-coletivo':
                // precisa ser o replace para não voltar para a listagem depois da inclusão
                ActionRoute.replace(`/planoAcao/${item['unidade_produtivas.id']}/${item['produtores.id']}`, {
                    planoAcaoColetivoId: param,
                });
                break;
            case 'checklist':
                ActionRoute.go(
                    `/buscaFormularioChecklistRedirect/novo_checklist/${item['unidade_produtivas.id']}/${
                        item['produtores.id']
                    }`
                );
                break;
            case 'produtor':
                ActionRoute.go(`/produtor/${item['produtores.id']}`);
                break;
            default:
                throw Error('Tipo inválido');
        }
    };

    renderItem = ({ item, index }) => {
        return (
            <Spacer vertical={0} horizontal={4}>
                <ItemListProfile
                    letters={letters(item['produtores.nome'])}
                    text1={item['produtores.nome']}
                    text2={item['unidade_produtivas.nome']}
                    text3={
                        item['unidade_produtivas.socios']
                            ? 'Sócios/Coproprietários: ' + item['unidade_produtivas.socios']
                            : null
                    }
                    text4={item.telefone_1}
                    onPress={this.onItemPress.bind(this, item)}
                />
            </Spacer>
        );
    };

    renderEmpty = () => {
        return <Empty text="Não foram encontrados Produtores ou Unidades Produtivas" />;
    };

    renderSeparator = () => {
        return (
            <Spacer vertical={0} horizontal={8}>
                <Separator />
            </Spacer>
        );
    };

    onQueryChange = _.debounce(query => {
        query = _.trim(query);
        this.setState({ query: query });
    }, 200);

    renderHeader = () => {
        return (
            <View style={styles.header}>
                <HeaderMenu title={'Selecione um(a) Produtor/a'} />

                <Spacer horizontal={3} bottom={4}>
                    <TextInputSearch
                        onChangeText={value => {
                            this.onQueryChange(value);
                        }}
                        onRef={elem => (this.input = elem)}
                        placeholder={'Pesquisar Produtor/a ou Unidade Produtiva'}
                    />
                </Spacer>
            </View>
        );
    };

    onInputFocus = () => {
        InteractionManager.runAfterInteractions(() => {
            if (this.input) {
                this.input.focus();
            }
        });
    };
    onCadastrarPress = () => {
        ActionRoute.go('/cadastroProdutor');
    };

    render() {
        if (this.state.loading) {
            return null;
        }

        const { query } = this.state;
        let filtroProdutorUnidadeProdutiva;
        if (this.props.location.state) {
            filtroProdutorUnidadeProdutiva = this.props.location.state.filtroProdutorUnidadeProdutiva;
        }

        return (
            <View style={styles.root}>
                <QueryDb
                    query={QUERY}
                    params={[
                        '%' + query + '%',
                        '%' + query + '%',
                        '%' + query + '%',
                        '%' + query + '%',
                        '%' + query + '%',
                    ]}
                    limit={LIMIT_QUERY}
                    onFirstComplete={this.onInputFocus}
                >
                    {(data, fetchMore, loadingMore) => {
                        if (filtroProdutorUnidadeProdutiva && filtroProdutorUnidadeProdutiva.length > 0) {
                            data = data.filter(
                                v =>
                                    filtroProdutorUnidadeProdutiva.some(
                                        f =>
                                            f.produtorId == v['produtores.id'] &&
                                            f.unidadeProdutivaId == v['unidade_produtivas.id']
                                    ) == false
                            );
                        }

                        return (
                            <React.Fragment>
                                <FlatList
                                    stickyHeaderIndices={[0]}
                                    data={data}
                                    contentContainerStyle={styles.scrollview}
                                    renderItem={this.renderItem}
                                    keyExtractor={this.keyExtractor}
                                    ListEmptyComponent={this.renderEmpty}
                                    ListHeaderComponent={this.renderHeader}
                                    ItemSeparatorComponent={this.renderSeparator}
                                    keyboardShouldPersistTaps={'handled'}
                                    removeClippedSubviews={true}
                                    onEndReached={fetchMore}
                                    onEndReachedThreshold={0.1}
                                    // refreshControl={<RefreshControl refreshing={loadingMore} onRefresh={null} />}
                                />

                                {loadingMore && <LoadingMore />}
                            </React.Fragment>
                        );
                    }}
                </QueryDb>
            </View>
        );
    }
}

export default connect(
    { signalSync: signal`app.sync` },
    BuscaProdutorRedirectPage
);
