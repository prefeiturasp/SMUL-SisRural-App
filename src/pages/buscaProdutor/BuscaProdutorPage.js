import _ from 'lodash';
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
import styles from './BuscaProdutorPage.styles';

const LIMIT_QUERY = 20;

const QUERY = `
select 
	P.id as "produtores.id",
	P.nome as "produtores.nome",
	P.telefone_1 as "telefone_1",
	P.cpf as "cpf",
	P.cnpj as "cnpj",
	GROUP_CONCAT(UP.nome, ', ') as "unidade_produtivas.nome",
	GROUP_CONCAT(UP.socios, ', ') as "unidade_produtivas.socios"
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

GROUP BY P.id

ORDER BY P.created_at ASC

LIMIT ${LIMIT_QUERY}
`;

//ORDER BY P.nome COLLATE NOCASE ASC

class BuscaProdutorPage extends React.Component {
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
        ActionRoute.go(`/produtor/${item['produtores.id']}`);
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
                <HeaderMenu title={'Selecione um Produtor ou \nUnidade Produtiva'} />

                <Spacer horizontal={3} bottom={4}>
                    <TextInputSearch
                        onChangeText={value => {
                            this.onQueryChange(value);
                        }}
                        onRef={elem => (this.input = elem)}
                        placeholder={'Pesquisar Produtor ou Unidade Produtiva'}
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

export default BuscaProdutorPage;
