import { connect } from '@cerebral/react';
import { signal } from 'cerebral/tags';
import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import {
    ActionRoute,
    Button,
    DropdownFilter,
    Empty,
    HeaderMenu,
    QueryDb,
    Separator,
    Spacer,
    TextInputSearch,
} from '../../../components';
import { CUPFormatStatus, CUPFormatStatusFlow } from '../../../db/typeORM/ChecklistUnidadeProdutivaModel';
import { makePromise } from '../../../utils/CerebralUtil';
import { letters } from '../../../utils/StringUtil';
import styles from './BuscaChecklistPage.styles';
import BuscaChecklistItem from './components/buscaChecklistItem/BuscaChecklistItem';

const QUERY = `
select 
CUP.id as 'id',
P.id as 'produtores.id',
P.nome as 'produtores.nome',
UP.id as 'unidade_produtivas.id',
UP.nome as 'unidade_produtivas.nome',
UP.socios as 'unidade_produtivas.socios',
C.nome as 'checklists.nome',
CUP.updated_at as 'date',
CUP.status as 'status',
CUP.status_flow as 'status_flow',
CUP.created_at as 'created_at',
CUP.updated_at as 'updated_at',
CUP.finished_at as 'finished_at'
FROM
 
produtores P,
checklists C,
checklist_unidade_produtivas CUP,
unidade_produtivas UP

where 

(UP.nome like :upnome OR P.nome like :pnome OR C.nome like :cnome OR UP.socios like :snome) AND

CUP.produtor_id = P.id and 
CUP.unidade_produtiva_id = UP.id and 
CUP.checklist_id = C.id and 

C.deleted_at is null and 
CUP.deleted_at is null 

`;

// P.deleted_at is null and
// UP.deleted_at is null

const QUERY_FILTER_STATUS = `
    AND CUP.status = :filter
`;

const QUERY_FILTER_PRODUTOR = `
    AND CUP.produtor_id = :produtorId
`;

//AND CUP.status <> 'cancelado'
const QUERY_FILTER_GERAR_PDA = `
    AND C.plano_acao IN ('opcional','obrigatorio')
    AND EXISTS (SELECT 1
                  FROM checklist_categorias CC,
                       checklist_perguntas CP                       
                 WHERE CC.checklist_id = CUP.checklist_id
                   AND CC.deleted_at IS NULL
                   AND CP.checklist_categoria_id = CC.id
                   AND CP.deleted_at IS NULL
                   AND CP.fl_plano_acao = 1                 
                )
    AND NOT EXISTS (SELECT 1 
                    FROM plano_acoes PA 
                    WHERE PA.status != 'cancelado' AND PA.deleted_at is null 
                        AND PA.checklist_unidade_produtiva_id =  CUP.id
                    ) 
    AND C.can_apply = 1
`;

// ORDER BY CUP.status = 'rascunho' DESC, CUP.status = 'aguardando_pda', CUP.status = 'aguardando_aprovacao' DESC, CUP.status = 'finalizado' DESC, CUP.status = 'cancelado' DESC, CUP.created_at DESC
const QUERY_ORDER_BY = `
    ORDER BY CUP.created_at DESC
`;

const QUERY_LIMIT = `
    LIMIT 200
`;

const FILTERS = [
    { value: 'todos', label: 'Todos' },
    { value: 'rascunho', label: 'Rascunho' },
    { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação' },
    { value: 'aguardando_pda', label: 'Aguardando Plano de Ação' },
    { value: 'finalizado', label: 'Finalizado' },
    { value: 'cancelado', label: 'Cancelado' },
];

class BuscaChecklistPage extends React.Component {
    static propTypes = {};

    state = {
        query: '',
        filter: 'todos',
        loading: true,
    };

    keyExtractor = (item, index) => {
        return index.toString();
    };

    onItemPress = (item) => {
        const {
            match: {
                params: { tipo },
            },
        } = this.props;

        switch (tipo) {
            case 'plano-acao':
                ActionRoute.go(`/planoAcao/${item['unidade_produtivas.id']}/${item['produtores.id']}/${item.id}`);
                break;
            default:
                ActionRoute.go(`/editarChecklist/${item.id}`);
                break;
        }
    };

    renderItem = ({ item, index }) => {
        return (
            <Spacer vertical={0} horizontal={4}>
                <BuscaChecklistItem
                    letters={letters(item['produtores.nome'])}
                    nome={item['checklists.nome']}
                    unidadeProdutiva={item['unidade_produtivas.nome']}
                    socios={item['unidade_produtivas.socios']}
                    criadoEm={
                        item.created_at ? moment.utc(item.created_at).local().format('DD/MM/YYYY \\à\\s HH:mm') : null
                    }
                    // atualizadoEm={
                    //     item.updated_at ? moment.utc(item.updated_at).local().format('DD/MM/YYYY \\à\\s HH:mm') : null
                    // }
                    finalizadoEm={
                        item.finished_at ? moment.utc(item.finished_at).local().format('DD/MM/YYYY \\à\\s HH:mm') : null
                    }
                    produtor={item['produtores.nome']}
                    status={CUPFormatStatus(item.status)}
                    statusFlow={CUPFormatStatusFlow(item.status_flow)}
                    onPress={this.onItemPress.bind(this, item)}
                />
            </Spacer>
        );
    };

    renderEmpty = () => {
        return <Empty text="Não foram encontrados formulários aplicados" />;
    };

    renderSeparator = () => {
        return (
            <Spacer vertical={0} horizontal={8}>
                <Separator />
            </Spacer>
        );
    };

    onQueryChange = _.debounce((query) => {
        query = _.trim(query);

        this.setState({ query: query });
    }, 200);

    onFilterChange = (filter) => {
        this.setState({ filter });
    };
    getFilterLabel = (value) => {
        return FILTERS.filter((v) => v.value === value)[0].label;
    };

    renderHeader = () => {
        const {
            match: {
                params: { tipo },
            },
        } = this.props;

        let showStatusFilter = true;
        if (tipo == 'plano-acao') {
            showStatusFilter = false;
        }

        return (
            <View style={styles.header}>
                <HeaderMenu title={'Formulários'} />

                <Spacer horizontal={3} bottom={1}>
                    <TextInputSearch
                        onChangeText={(value) => {
                            this.onQueryChange(value);
                        }}
                        onRef={(elem) => (this.input = elem)}
                        placeholder={'Pesquisar Formulários'}
                    />
                </Spacer>

                <Spacer horizontal={3}>
                    {showStatusFilter && (
                        <DropdownFilter
                            onChangeText={this.onFilterChange}
                            label={this.getFilterLabel(this.state.filter)}
                            value={this.state.filter}
                            data={FILTERS}
                        />
                    )}
                </Spacer>
            </View>
        );
    };

    onInputFocus = () => {
        this.input && this.input.focus();
    };

    onHomePress = () => {
        ActionRoute.go('/home');
    };

    componentDidMount() {
        const { promise, id } = makePromise();

        this.props.signalInit({
            onComplete: id,
        });

        promise.then((data) => {
            this.setState({ loading: false });
        });
    }

    render() {
        if (this.state.loading) {
            return false;
        }

        const {
            location: {
                state: { produtorId },
            },
            match: {
                params: { tipo },
            },
        } = this.props;

        const { query, filter } = this.state;

        let dbQuery = QUERY;
        const dbQueryParams = ['%' + query + '%', '%' + query + '%', '%' + query + '%', '%' + query + '%'];

        if (filter && filter !== 'todos') {
            dbQuery += QUERY_FILTER_STATUS;
            dbQueryParams.push(filter);
        }

        if (produtorId) {
            dbQuery += QUERY_FILTER_PRODUTOR;
            dbQueryParams.push(produtorId);
        }

        if (tipo && tipo === 'plano-acao') {
            dbQuery += QUERY_FILTER_GERAR_PDA;
        }

        dbQuery += QUERY_ORDER_BY + QUERY_LIMIT;

        return (
            <View style={styles.root}>
                <QueryDb query={dbQuery} params={dbQueryParams} onFirstComplete={this.onInputFocus}>
                    {(data) => {
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
                                />
                            </React.Fragment>
                        );
                    }}
                </QueryDb>

                <View style={styles.footer}>
                    <Spacer vertical={4} horizontal={4}>
                        <Button mode="contained" onPress={this.onHomePress}>
                            VOLTAR PARA TELA INICIAL
                        </Button>
                    </Spacer>
                </View>
            </View>
        );
    }
}

export default connect({ signalInit: signal`checklist.init` }, BuscaChecklistPage);
