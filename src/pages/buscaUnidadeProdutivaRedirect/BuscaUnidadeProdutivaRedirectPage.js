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
import { letters } from '../../utils/StringUtil';
import styles from './BuscaUnidadeProdutivaRedirectPage.styles';

const LIMIT_QUERY = 20;

const QUERY = `
select 
	P.id as "produtores.id",
	P.nome as "produtores.nome",
	UP.id as "unidade_produtivas.id", 
	UP.nome as "unidade_produtivas.nome"
from produtores P 
	 JOIN produtor_unidade_produtiva PUP on P.id = PUP.produtor_id
	 JOIN unidade_produtivas UP on UP.id = PUP.unidade_produtiva_id
WHERE
    UP.nome like :upnome
    AND (
        P.deleted_at IS NULL AND
        PUP.deleted_at IS NULL AND
        UP.deleted_at IS NULL 
    )
    AND P.id = :pid

ORDER BY P.nome COLLATE NOCASE ASC

LIMIT ${LIMIT_QUERY}
`;

class BuscaUnidadeProdutivaRedirectPage extends React.Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                tipo: PropTypes.oneOf(['caderno', 'listagem', 'novo-checklist', 'plano-acao']),
            }),
        }),
    };

    state = {
        query: '',
    };

    constructor(props) {
        super(props);
    }

    keyExtractor = (item, index) => {
        return index.toString();
    };

    onItemPress = item => {
        const {
            match: {
                params: { tipo },
            },
        } = this.props;

        switch (tipo) {
            case 'caderno':
                ActionRoute.go(`/cadastroCadernoCampo/${item['unidade_produtivas.id']}/${item['produtores.id']}`);
                break;

            case 'listagem':
                ActionRoute.go(`/cadastroUnidadeProdutiva/${item['unidade_produtivas.id']}/${item['produtores.id']}`);
                break;
            case 'plano-acao':
                ActionRoute.go(`/planoAcao/${item['unidade_produtivas.id']}/${item['produtores.id']}`);
                break;
            case 'novo-checklist':
                ActionRoute.go(
                    `/buscaFormularioChecklistRedirect/novo_checklist/${item['unidade_produtivas.id']}/${
                        item['produtores.id']
                    }`
                );
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
                    text2={item['produtores.nome']}
                    text1={item['unidade_produtivas.nome']}
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
                <HeaderMenu title={'Unidade Produtiva'} />

                <Spacer horizontal={3} bottom={4}>
                    <TextInputSearch
                        onChangeText={value => {
                            this.onQueryChange(value);
                        }}
                        onRef={elem => (this.input = elem)}
                        placeholder={'Pesquisar Unidade Produtiva'}
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
        const { query } = this.state;
        const { produtorId } = this.props.location.state;

        return (
            <View style={styles.root}>
                <QueryDb
                    query={QUERY}
                    params={['%' + query + '%', produtorId]}
                    onFirstComplete={this.onInputFocus}
                    limit={LIMIT_QUERY}
                >
                    {(data, fetchMore, loadingMore) => {
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

export default BuscaUnidadeProdutivaRedirectPage;
