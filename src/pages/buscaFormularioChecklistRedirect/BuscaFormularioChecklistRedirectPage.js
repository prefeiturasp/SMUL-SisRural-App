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
import styles from './BuscaFormularioChecklistRedirectPage.styles';

const LIMIT_QUERY = 40;

const QUERY = `
select 
C.id as 'checklists.id',
C.nome as 'checklists.nome',
D.nome as 'dominios.nome',
C.updated_at as 'checklists.updated_at'
from checklists C, dominios D
WHERE
C.dominio_id = D.id and
(C.nome like :cnome or D.nome like :dnome ) and 
status = 'publicado' and
C.can_apply = 1
ORDER by C.nome COLLATE NOCASE ASC
LIMIT ${LIMIT_QUERY}
`;

class BuscaFormularioChecklistRedirectPage extends React.Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                tipo: PropTypes.oneOf(['novo_checklist']),
                unidadeProdutivaId: PropTypes.string.isRequired,
                produtorId: PropTypes.string.isRequired,
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
                params: { tipo, unidadeProdutivaId, produtorId },
            },
        } = this.props;

        switch (tipo) {
            case 'novo_checklist':
                ActionRoute.go(`/cadastroChecklist/${item['checklists.id']}/${unidadeProdutivaId}/${produtorId}`);
                break;
            default:
                throw Error('Tipo inválido');
        }
    };

    renderItem = ({ item, index }) => {
        return (
            <Spacer vertical={0} horizontal={4}>
                <ItemListProfile
                    letters={letters(item['dominios.nome'])}
                    text1={item['checklists.nome']}
                    text2={item['dominios.nome']}
                    onPress={this.onItemPress.bind(this, item)}
                />
            </Spacer>
        );
    };

    renderEmpty = () => {
        return <Empty text="Não foram encontrados Formulários" />;
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
                <HeaderMenu title={'Selecione um formulário'} />

                <Spacer horizontal={3} bottom={4}>
                    <TextInputSearch
                        onChangeText={value => {
                            this.onQueryChange(value);
                        }}
                        onRef={elem => (this.input = elem)}
                        placeholder={'Pesquisar Formulário'}
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

    render() {
        const { query } = this.state;

        return (
            <View style={styles.root}>
                <QueryDb
                    query={QUERY}
                    params={['%' + query + '%', '%' + query + '%']}
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

export default BuscaFormularioChecklistRedirectPage;
