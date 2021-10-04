import moment from 'moment';
import React from 'react';
import { FlatList, View } from 'react-native';
import {
    ActionRoute,
    Button,
    DropdownFilter,
    Empty,
    HeaderMenu,
    QueryDb,
    Separator,
    Spacer,
    ViewSmart
} from '../../components';
import { letters } from '../../utils/StringUtil';
import BuscaCadernoCampoItem from '../buscaCadernoCampo/components/buscaCadernoCampoItem/BuscaCadernoCampoItem';
import styles from './ProdutorCadernoCampoPage.styles';

const QUERY = `
SELECT  
cadernos.id AS "cadernos.id", 
cadernos.created_at AS "cadernos.created_at",
cadernos.status AS "cadernos.status",
produtores.nome AS "produtores.nome",
produtores.id AS "produtores.id",
unidade_produtivas.nome AS "unidade_produtivas.nome",
unidade_produtivas.id AS "unidade_produtivas.id",
(users.first_name || " " || users.last_name) AS "users.nome"

FROM cadernos, produtores, unidade_produtivas, users

WHERE 
cadernos.deleted_at is null AND
produtores.deleted_at is null AND
unidade_produtivas.deleted_at is null AND
 

cadernos.user_id = users.id AND
produtores.id = cadernos.produtor_id AND
unidade_produtivas.id = cadernos.unidade_produtiva_id AND

produtores.id = :produtor_id  

`;

const QUERY_FILTER = `
    AND cadernos.status = :filter
`;

const QUERY_ORDER_BY = `
    ORDER BY cadernos.created_at DESC, produtores.nome COLLATE NOCASE ASC
`;

const FILTERS = [
    { value: 'todos', label: 'Todos' },
    { value: 'rascunho', label: 'Rascunho' },
    { value: 'finalizado', label: 'Finalizado' },
];

class ProdutorCadernoCampoPage extends React.Component {
    static propTypes = {};

    state = {
        query: '',
        filter: 'todos',
    };

    keyExtractor = (item, index) => {
        return index.toString();
    };

    onItemPress = item => {
        ActionRoute.go(`/editarCadernoCampo/${item['cadernos.id']}`);
    };

    renderItem = ({ item, index }) => {
        const date = moment
            .utc(item['cadernos.created_at'])
            .local()
            .format('DD/MM/YYYY \\à\\s HH:mm');
        return (
            <Spacer vertical={0} horizontal={4}>
                <BuscaCadernoCampoItem
                    letters={letters(item['produtores.nome'])}
                    nome={item['produtores.nome']}
                    unidadeProdutiva={item['unidade_produtivas.nome']}
                    ultimaVisita={item['cadernos.created_at'] ? 'Ultima visita em ' + date : null}
                    tecnico={item['users.nome']}
                    status={this.getFilterLabel(item['cadernos.status'])}
                    onPress={this.onItemPress.bind(this, item)}
                />
            </Spacer>
        );
    };

    renderEmpty = () => {
        return <Empty text="Não foram encontrados Cadernos de Campo" />;
    };

    renderSeparator = () => {
        return (
            <Spacer vertical={0} horizontal={8}>
                <Separator />
            </Spacer>
        );
    };

    onFilterChange = filter => {
        this.setState({ filter });
    };

    getFilterLabel = value => {
        return FILTERS.filter(v => v.value === value)[0].label;
    };

    renderHeader = () => {
        return (
            <View style={styles.header}>
                <HeaderMenu title={'Cadernos de Campo'} />

                <Spacer horizontal={3}>
                    <DropdownFilter
                        onChangeText={this.onFilterChange}
                        label={this.getFilterLabel(this.state.filter)}
                        value={this.state.filter}
                        data={FILTERS}
                    />
                </Spacer>
            </View>
        );
    };

    onHomePress = () => {
        ActionRoute.back();
        //ActionRoute.go('/home');
    };

    render() {
        const {
            match: {
                params: { produtorId },
            },
        } = this.props;

        const { filter } = this.state;
        let dbQuery, dbQueryParams;

        if (filter === 'todos') {
            dbQuery = QUERY + QUERY_ORDER_BY;
            dbQueryParams = [produtorId];
        } else {
            dbQuery = QUERY + QUERY_FILTER + QUERY_ORDER_BY;
            dbQueryParams = [produtorId, filter];
        }

        return (
            <View style={styles.root}>
                <QueryDb query={dbQuery} params={dbQueryParams}>
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
                                keyboardShouldPersistTaps={'handled'}
                                removeClippedSubviews={true}
                            />
                        );
                    }}
                </QueryDb>

                <ViewSmart flex1 />

                <View style={styles.footer}>
                    <Spacer vertical={4} horizontal={4}>
                        <Button mode="contained" onPress={this.onHomePress}>
                            VOLTAR PARA O PRODUTOR
                        </Button>
                    </Spacer>
                </View>
            </View>
        );
    }
}

export default ProdutorCadernoCampoPage;
