/* eslint-disable radix */
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
    Empty,
    HeaderMenu,
    LoadingMore,
    QueryDb,
    Separator,
    SmartIcon,
    Spacer,
    Text,
    TextInputSearch,
    Touchable,
} from '../../../components';
import { PLANO_ACAO_STATUS } from '../../../modules/PlanoAcaoModule';
import Theme from '../../../Theme';
import { makePromise } from '../../../utils/CerebralUtil';
import ModalFiltro from '../components/modalFiltro/ModalFiltro';
import PlanoAcaoItem from '../components/planoAcaoItem/PlanoAcaoItem';
import styles from './BuscaPlanoAcaoPage.styles';

const LIMIT = 40;

const QUERY = `
SELECT
    PA.id as 'id',
    PA.nome as 'nome',
    PA.status as 'status',
    PA.created_at as 'data_criacao',
    PA.updated_at as 'data_update',
    PA.prazo as 'prazo',
    UP.nome as 'unidade_produtivas.nome',
    P.nome as 'produtores.nome',
    C.nome as 'checklists.nome'
FROM plano_acoes PA
LEFT JOIN produtores P ON P.id = PA.produtor_id 
LEFT JOIN unidade_produtivas UP ON UP.id = PA.unidade_produtiva_id 
LEFT JOIN checklist_unidade_produtivas CUP ON CUP.id = PA.checklist_unidade_produtiva_id AND CUP.deleted_at IS NULL
LEFT JOIN checklists C ON C.id = CUP.checklist_id AND C.deleted_at IS NULL
WHERE PA.deleted_at IS NULL
  AND PA.fl_coletivo = :flColetivo
  AND PA.plano_acao_coletivo_id IS NULL
  AND (PA.nome like :panome OR UP.nome like :upnome OR P.nome like :pnome)
`;

const QUERY_FILTER_STATUS = `
    AND PA.status = :filter
`;

const QUERY_FILTER_PRODUTOR = `
    AND PA.produtor_id = :produtorId
`;

const QUERY_FILTER_PRODUTOR_COLETIVO = `
    AND EXISTS (
        SELECT 1 
          FROM plano_acoes PAF 
         WHERE PAF.plano_acao_coletivo_id = PA.id
           AND PAF.deleted_at IS NULL
           AND PAF.produtor_id = :produtorId
    )
`;

const QUERY_FILTER_FORMULARIO_CHECKLIST = `
    AND CUP.checklist_id = :checklistId
`;

/*
    ORDER BY
        PA.status = 'rascunho' DESC, 
        PA.status = 'aguardando_aprovacao' DESC, 
        PA.status = 'nao_iniciado' DESC, 
        PA.status = 'em_andamento' DESC, 
        PA.status = 'concluido' DESC, 
        PA.status = 'cancelado' DESC, 
        PA.created_at DESC
*/

const QUERY_ORDER_BY = `
    ORDER BY PA.updated_at DESC 
`;

const QUERY_LIMIT = `
    LIMIT ${LIMIT}
`;

class BuscaPlanoAcaoPage extends React.Component {
    static propTypes = {};

    state = {
        query: '',
        filterStatus: null,
        filterChecklist: null,
        filterOpen: false,
        loading: true,
    };

    componentDidMount() {
        const { promise, id } = makePromise();

        this.props.signalSync({ onComplete: id });

        promise.then((data) => {
            this.setState({ loading: false });
        });
    }

    keyExtractor = (item, index) => {
        return index.toString();
    };

    onItemPress = (item) => {
        ActionRoute.go(`/planoAcao/${item.id}`);
    };

    renderItem = ({ item, index }) => {
        const { tipo } = this.props.match.params;

        const dataCriacao = item.data_criacao
            ? moment.utc(item.data_criacao).local().format('DD/MM/YYYY \\à\\s HH:mm')
            : null;

        const dataUpdate = item.data_update
            ? moment.utc(item.data_update).local().format('DD/MM/YYYY \\à\\s HH:mm')
            : null;

        const dataValidade = item.prazo ? moment(item.prazo).format('DD/MM/YYYY') : null;

        return (
            <Spacer vertical={0} horizontal={4}>
                <PlanoAcaoItem
                    nome={item.nome}
                    unidadeProdutiva={item['unidade_produtivas.nome']}
                    produtor={item['produtores.nome']}
                    mostrarInfoChecklist={tipo != 'coletivo'}
                    checklist={item['checklists.nome']}
                    status={this.getFilterLabel(item.status)}
                    statusValue={item.status}
                    dataCriacao={dataCriacao}
                    dataUpdate={dataUpdate}
                    dataValidade={dataValidade}
                    onPress={this.onItemPress.bind(this, item)}
                />
            </Spacer>
        );
    };

    renderEmpty = () => {
        return <Empty text="Não foram encontrados Planos de Ação" />;
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

    getFilterLabel = (value) => {
        if (!value) {
            return 'Todos';
        }
        return PLANO_ACAO_STATUS.filter((v) => v.value === value)[0].label;
    };

    onConfirmarFiltro({ status, checklist }) {
        this.toogleFilterOpen();
        this.setState({ filterStatus: status, filterChecklist: checklist });
    }

    toogleFilterOpen() {
        this.setState({ filterOpen: !this.state.filterOpen });
    }

    renderHeader = () => {
        const { filterStatus, filterChecklist } = this.state;

        const { tipo } = this.props.match.params;

        const tiposFiltro = ['status_pda'];
        let title;

        switch (tipo) {
            case 'individual':
                tiposFiltro.push('checklist');
                title = `Planos de Ação Individuais`;
                break;
            case 'coletivo':
                title = `Planos de Ação Coletivos`;
                break;
        }

        return (
            <View style={styles.header}>
                <HeaderMenu title={title} />

                <Spacer horizontal={3} bottom={1}>
                    <TextInputSearch
                        onChangeText={(value) => {
                            this.onQueryChange(value);
                        }}
                        onRef={(elem) => (this.input = elem)}
                        placeholder={'Pesquisar Planos de Ação'}
                    />
                </Spacer>

                <Touchable style={styles.filtro} onPress={this.toogleFilterOpen.bind(this)}>
                    <Text size14 slateGrey>
                        Filtrar por:{'  '}
                    </Text>
                    {(!filterChecklist || filterStatus) && (
                        <Text size14 teal fontBold>
                            {this.getFilterLabel(filterStatus)}
                        </Text>
                    )}
                    {filterChecklist && (
                        <QueryDb
                            query={'SELECT nome FROM checklists WHERE id = :cheklistId AND deleted_at IS NULL'}
                            params={[filterChecklist]}
                            returnFirst
                        >
                            {(data) => {
                                return (
                                    <>
                                        <Text size14 teal fontBold>
                                            {`${filterStatus ? ', ' : ''}${data.nome}`}
                                        </Text>
                                    </>
                                );
                            }}
                        </QueryDb>
                    )}
                    <SmartIcon icon="materialicons@arrow-drop-down" size={24} color={Theme.colors.teal} />
                </Touchable>
                <ModalFiltro
                    tipos={tiposFiltro}
                    visible={this.state.filterOpen}
                    onCancelar={this.toogleFilterOpen.bind(this)}
                    onConfirmar={this.onConfirmarFiltro.bind(this)}
                />
            </View>
        );
    };

    onInputFocus = () => {
        this.input && this.input.focus();
    };

    onHomePress = () => {
        const { produtorId } = this.props.location.state;
        if (produtorId) {
            ActionRoute.back();
        } else {
            ActionRoute.go('/home');
        }
    };

    render() {
        if (this.state.loading) {
            return null;
        }

        const { query, filterStatus, filterChecklist } = this.state;
        const { tipo } = this.props.match.params;
        const { produtorId } = this.props.location.state;

        let coletivo;

        switch (tipo) {
            case 'individual':
                coletivo = 0;
                break;
            case 'coletivo':
                coletivo = 1;
                break;
        }

        let dbQuery = QUERY;
        let dbQueryParams = [coletivo, '%' + query + '%', '%' + query + '%', '%' + query + '%'];

        if (filterStatus) {
            dbQuery += QUERY_FILTER_STATUS;
            dbQueryParams.push(filterStatus);
        }

        if (produtorId) {
            if (coletivo === 0) {
                dbQuery += QUERY_FILTER_PRODUTOR;
            } else {
                dbQuery += QUERY_FILTER_PRODUTOR_COLETIVO;
            }
            dbQueryParams.push(produtorId);
        }

        if (filterChecklist) {
            dbQuery += QUERY_FILTER_FORMULARIO_CHECKLIST;
            dbQueryParams.push(filterChecklist);
        }

        dbQuery += QUERY_ORDER_BY + QUERY_LIMIT;

        return (
            <View style={styles.root}>
                <QueryDb query={dbQuery} params={dbQueryParams} onFirstComplete={this.onInputFocus} limit={LIMIT}>
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

                <View style={styles.footer}>
                    <Spacer vertical={4} horizontal={4}>
                        <Button mode="contained" onPress={this.onHomePress}>
                            {!produtorId ? 'VOLTAR PARA TELA INICIAL' : 'VOLTAR'}
                        </Button>
                    </Spacer>
                </View>
            </View>
        );
    }
}

export default connect({ signalSync: signal`planoAcao.sync` }, BuscaPlanoAcaoPage);
