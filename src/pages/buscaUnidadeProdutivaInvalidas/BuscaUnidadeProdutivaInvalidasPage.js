import { connect } from '@cerebral/react';
import { state } from 'cerebral/tags';
import _ from 'lodash';
import React from 'react';
import { Alert, FlatList, InteractionManager, View } from 'react-native';
import {
    ActionRoute,
    Empty,
    HeaderMenu,
    ItemListProfile,
    QueryDb,
    Separator,
    Spacer,
    Text,
    TextInputSearch,
} from '../../components';
import { letters } from '../../utils/StringUtil';
import styles from './BuscaUnidadeProdutivaInvalidasPage.styles';

const QUERY = `
select 
	P.id as "produtores.id",
	P.nome as "produtores.nome",
	UP.id as "unidade_produtivas.id", 
	UP.nome as "unidade_produtivas.nome"
from unidade_produtivas UP 
	LEFT JOIN produtor_unidade_produtiva PUP on UP.id = PUP.unidade_produtiva_id
	LEFT JOIN produtores P on P.id = PUP.produtor_id
WHERE
    UP.nome like :upnome AND
    P.deleted_at IS NULL AND
    PUP.deleted_at IS NULL AND
    UP.deleted_at IS NULL AND
    UP.owner_id = :owner_id AND
    UP.fl_fora_da_abrangencia_app = 1

ORDER BY UP.nome COLLATE NOCASE ASC, P.nome COLLATE NOCASE ASC

LIMIT 100`;

class BuscaUnidadeProdutivaInvalidasPage extends React.Component {
    static propTypes = {};

    state = {
        query: '',
    };

    keyExtractor = (item, index) => {
        return index.toString();
    };

    onItemPress = item => {
        if (!item['produtores.id']) {
            Alert.alert(
                'Aviso',
                'Não é possível acessar a unidade produtiva, ela precisa estar vinculada a um produtor.'
            );
            return;
        }

        ActionRoute.go(`/cadastroUnidadeProdutiva/${item['unidade_produtivas.id']}/${item['produtores.id']}`);
    };

    renderItem = ({ item, index }) => {
        const textProdutor = item['produtores.nome'] ? (
            <Text charcoal size14>
                Produtor/a:{' '}
                <Text teal size14>
                    {item['produtores.nome']}
                </Text>
            </Text>
        ) : null;

        return (
            <Spacer vertical={0} horizontal={4}>
                <ItemListProfile
                    letters={letters(item['unidade_produtivas.nome'])}
                    text1={item['unidade_produtivas.nome']}
                    text2={textProdutor}
                    // text3="Ultima visita em 12/12/19,  às 9:00"
                    onPress={this.onItemPress.bind(this, item)}
                />
            </Spacer>
        );
    };

    renderEmpty = () => {
        return <Empty text="Não foram encontrados Unidades Produtivas" />;
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
                <HeaderMenu title={`Unidades Produtivas\nFora da Área de Abrangência`} />

                <Spacer horizontal={3} bottom={4}>
                    <TextInputSearch
                        onChangeText={value => {
                            this.onQueryChange(value);
                        }}
                        onRef={elem => (this.input = elem)}
                        placeholder="Pesquisar Unidade Produtiva"
                    />
                </Spacer>
            </View>
        );
    };

    onInputFocus = () => {
        InteractionManager.runAfterInteractions(() => {
            this.input.focus();
        });
    };

    render() {
        const { query } = this.state;
        const { user } = this.props;

        return (
            <View style={styles.root}>
                <QueryDb query={QUERY} params={['%' + query + '%', user.id]} onFirstComplete={this.onInputFocus}>
                    {data => {
                        return (
                            <FlatList
                                stickyHeaderIndices={[0]}
                                data={data}
                                contentContainerStyle={styles.scrollview}
                                renderItem={this.renderItem}
                                keyExtractor={this.keyExtractor}
                                ListEmptyComponent={this.renderEmpty}
                                ListHeaderComponent={this.renderHeader}
                                ItemSeparatorComponent={this.renderSeparator}
                            />
                        );
                    }}
                </QueryDb>
            </View>
        );
    }
}

export default connect(
    { user: state`auth.user` },
    BuscaUnidadeProdutivaInvalidasPage
);
