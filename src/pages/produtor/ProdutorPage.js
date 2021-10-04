import { connect } from '@cerebral/react';
import { signal } from 'cerebral/tags';
import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import {
    ActionRoute,
    CardAdd,
    CardSearch,
    CardSearchEmpty,
    HeaderMenu,
    QueryDb,
    Separator,
    SmartIcon,
    Spacer,
    Text,
    Touchable,
    ViewSmart,
    withDb,
} from '../../components';
import Theme from '../../Theme';
import { makePromise } from '../../utils/CerebralUtil';
import { letters } from '../../utils/StringUtil';
import styles from './ProdutorPage.styles';

class ProdutorPage extends React.Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                produtorId: PropTypes.string.isRequired,
            }),
        }),
    };

    constructor(props) {
        super(props);

        this.state = { loadingSync: true };
    }

    componentDidMount() {
        const { promise, id } = makePromise();

        this.props.signalSync({ onComplete: id });

        promise.then((data) => {
            this.setState({ loadingSync: false });
        });
    }

    renderProdutor = () => {
        const [produtor] = this.props.produtor;

        const { unidades } = this.props;

        const socios = unidades ? unidades.map((v) => v.socios).join(', ') : null;

        return (
            <ViewSmart row justifyCenter>
                <Avatar.Text
                    size={55}
                    label={letters(produtor.nome)}
                    style={styles.avatar}
                    labelStyle={styles.avatarLabel}
                />

                <Spacer horizontal={2} />

                <ViewSmart flex1>
                    <Text size20 charcoal>
                        {produtor.nome}
                    </Text>

                    <Spacer vertical={0.5} />

                    {!!produtor.telefone_1 && (
                        <Text size14 coolGrey>
                            {produtor.telefone_1}
                        </Text>
                    )}

                    {!!produtor.telefone_2 && (
                        <React.Fragment>
                            <Spacer vertical={0.5} />

                            <Text size14 coolGrey>
                                {produtor.telefone_2}
                            </Text>
                        </React.Fragment>
                    )}

                    {!!socios && socios.length > 2 && (
                        <React.Fragment>
                            <Spacer vertical={0.5} />

                            <Text size14 coolGrey>
                                Sócios/Coproprietários: {socios}
                            </Text>
                        </React.Fragment>
                    )}
                </ViewSmart>
            </ViewSmart>
        );
    };

    onDadosProdutorPress = () => {
        const { produtorId } = this.props.match.params;
        ActionRoute.go(`/cadastroProdutor/${produtorId}`);
    };

    onCadernoPress = () => {
        const { produtorId } = this.props.match.params;
        ActionRoute.go(`/produtorCadernoCampo/${produtorId}`);
    };

    onNovoCadernoPress = () => {
        const { unidades } = this.props;
        const { produtorId } = this.props.match.params;

        if (unidades && unidades.length === 1) {
            ActionRoute.go(`/cadastroCadernoCampo/${unidades[0].id}/${produtorId}`);
        } else {
            ActionRoute.go(`/buscaUnidadeProdutivaRedirect/caderno`, {
                produtorId: produtorId,
            });
        }
    };

    onAdicionarChecklistPress = () => {
        const { unidades } = this.props;
        const { produtorId } = this.props.match.params;

        if (unidades && unidades.length === 1) {
            ActionRoute.go(`/buscaFormularioChecklistRedirect/novo_checklist/${unidades[0].id}/${produtorId}`);
        } else {
            ActionRoute.go(`/buscaUnidadeProdutivaRedirect/novo-checklist`, {
                produtorId,
            });
        }
    };

    onChecklistsPress = (data) => {
        const { produtorId } = this.props.match.params;
        if (data.length === 1) {
            ActionRoute.go(`/editarChecklist/${data[0].checklistUnidadeProdutivaId}`);
        } else {
            ActionRoute.go('/buscaChecklist', { produtorId });
        }
    };

    onUnidadePress = (unidade) => {
        const { produtorId } = this.props.match.params;
        ActionRoute.go(`/cadastroUnidadeProdutiva/${unidade.id}/${produtorId}`);
    };

    onUnidadesPress = () => {
        const { produtorId } = this.props.match.params;

        const { unidades } = this.props;

        if (unidades && unidades.length > 1) {
            ActionRoute.go(`/buscaUnidadeProdutivaRedirect/listagem`, {
                produtorId: produtorId,
            });
        } else if (unidades && unidades.length === 1) {
            ActionRoute.go(`/cadastroUnidadeProdutiva/${unidades[0].id}/${produtorId}`);
        }
    };

    onAdicionarPlanoAcaoPress = () => {
        const { produtorId } = this.props.match.params;
        const { unidades } = this.props;

        if (unidades && unidades.length > 1) {
            ActionRoute.go(`/buscaUnidadeProdutivaRedirect/plano-acao`, {
                produtorId: produtorId,
            });
        } else if (unidades && unidades.length === 1) {
            ActionRoute.go(`/planoAcao/${unidades[0].id}/${produtorId}`);
        }
    };

    onAdicionarPlanoAcaoFormularioPress = () => {
        const { produtorId } = this.props.match.params;

        ActionRoute.go(`/buscaChecklistRedirect/plano-acao`, { produtorId });
    };

    onPlanosAcaoPress = (data, tipo) => {
        const { produtorId } = this.props.match.params;

        if (data.length === 1) {
            let planoAcaoId = data[0].planoAcaoId;
            if (tipo === 'coletivo') {
                planoAcaoId = data[0].planoAcaoColetivoId;
            }
            ActionRoute.go(`/planoAcao/${planoAcaoId}`);
        } else {
            ActionRoute.go(`/buscaPlanoAcao/${tipo}`, { produtorId });
        }
    };

    onNovaUnidadeProdutivaPress = () => {
        const { produtorId } = this.props.match.params;

        ActionRoute.go(`/cadastroUnidadeProdutiva/0/${produtorId}`);
    };

    renderUnidades = (unidades) => {
        return unidades.map((unidade, i) => {
            return (
                <Touchable key={i} onPress={this.onUnidadePress.bind(this, unidade)}>
                    <Spacer horizontal={0} vertical={2}>
                        <ViewSmart row alignCenter>
                            <View style={styles.flex1}>
                                <Text>{unidade.nome}</Text>

                                <Text coolGrey>{`${unidade.endereco || ''} ${unidade.bairro || ''} ${
                                    unidade.cep || ''
                                }`}</Text>

                                <Spacer />
                            </View>

                            <View>
                                <SmartIcon color={Theme.colors.coolGrey} size={20} icon="materialicons@edit" />
                            </View>
                        </ViewSmart>

                        <Separator />
                    </Spacer>
                </Touchable>
            );
        });
    };

    render() {
        if (this.state.loadingSync) {
            return null;
        }

        const { produtorId } = this.props.match.params;

        return (
            <View style={styles.root}>
                <HeaderMenu title="Produtor/a" />

                <ScrollView contentContainerStyle={styles.scrollview}>
                    <Spacer horizontal={4}>
                        {this.renderProdutor()}

                        <Spacer vertical={6} horizontal={0}>
                            <Separator />
                        </Spacer>

                        {this.props.unidades.length > 0 && (
                            <View>
                                <Text size20 charcoal>
                                    Unidades Produtivas
                                </Text>

                                {this.renderUnidades(this.props.unidades)}

                                <Spacer vertical={2} />
                            </View>
                        )}

                        <ViewSmart row alignCenter justifyCenter flexWrap>
                            <QueryDb
                                query={
                                    'select count(cadernos.id) as total from cadernos where produtor_id = :produtor_id and deleted_at is null'
                                }
                                params={[produtorId]}
                            >
                                {(data) => {
                                    return (
                                        <CardSearch
                                            title={'Cadernos de campo'}
                                            subtitle={data[0].total}
                                            onPress={this.onCadernoPress}
                                        />
                                    );
                                }}
                            </QueryDb>

                            <CardAdd
                                title={'Novo Caderno de Campo'}
                                subtitle={'CRIAR'}
                                onPress={this.onNovoCadernoPress}
                            />

                            <CardSearch
                                icon="iconimage@unidadeProdutiva"
                                title={'Unidades Produtivas'}
                                onPress={this.onUnidadesPress}
                                subtitle={this.props.unidades.length}
                                disabled={this.props.unidades.length === 0}
                            />

                            <CardAdd title={'Produtor/a'} subtitle={'EDITAR'} onPress={this.onDadosProdutorPress} />

                            <QueryDb
                                query={`select id as checklistUnidadeProdutivaId from checklist_unidade_produtivas where produtor_id = :produtorId and deleted_at is null`}
                                params={[produtorId]}
                            >
                                {(data) => {
                                    return (
                                        <CardSearch
                                            icon="iconimage@caderno"
                                            title={'Formulários'}
                                            onPress={this.onChecklistsPress.bind(this, data)}
                                            subtitle={data.length}
                                            disabled={data.length === 0}
                                        />
                                    );
                                }}
                            </QueryDb>

                            <CardAdd
                                title={'Aplicar Formulário'}
                                subtitle={'CRIAR'}
                                onPress={this.onAdicionarChecklistPress}
                            />

                            <QueryDb
                                query={`select id as planoAcaoId 
                                    from plano_acoes 
                                    where produtor_id = :produtor_id and fl_coletivo = 0 and deleted_at is null`}
                                params={[produtorId]}
                            >
                                {(data) => {
                                    return (
                                        <CardSearch
                                            icon="iconimage@planoAcao"
                                            title={'Planos de Ação'}
                                            onPress={this.onPlanosAcaoPress.bind(this, data, 'individual')}
                                            subtitle={data.length}
                                            disabled={data.length === 0}
                                        />
                                    );
                                }}
                            </QueryDb>

                            <CardAdd
                                title={'Plano de Ação'}
                                subtitle={'CRIAR'}
                                onPress={this.onAdicionarPlanoAcaoPress}
                            />

                            <QueryDb
                                query={`select id as planoAcaoId, plano_acao_coletivo_id as planoAcaoColetivoId 
                                    from plano_acoes 
                                    where produtor_id = :produtor_id and fl_coletivo = 1 and deleted_at is null`}
                                params={[produtorId]}
                            >
                                {(data) => {
                                    return (
                                        <CardSearch
                                            icon="iconimage@planoAcao"
                                            title={'Planos de Ação Coletivos'}
                                            onPress={this.onPlanosAcaoPress.bind(this, data, 'coletivo')}
                                            subtitle={data.length}
                                            disabled={data.length === 0}
                                        />
                                    );
                                }}
                            </QueryDb>

                            <CardAdd
                                title={'Plano de Ação Formulário'}
                                subtitle={'CRIAR'}
                                onPress={this.onAdicionarPlanoAcaoFormularioPress}
                            />
                            <CardSearchEmpty />

                            <CardAdd
                                title={'Criar Nova Unidade Produtiva'}
                                subtitle={'CRIAR'}
                                onPress={this.onNovaUnidadeProdutivaPress}
                            />
                        </ViewSmart>

                        <Spacer vertical={4} />
                    </Spacer>
                </ScrollView>
            </View>
        );
    }
}

const QUERY_PRODUTOR = 'select * from produtores where id = :id AND deleted_at IS NULL';

const QUERY_UNIDADES = `select U.* from unidade_produtivas U , produtor_unidade_produtiva PU where 
    U.deleted_at IS NULL AND 
    PU.deleted_at IS NULL AND 
    U.id = unidade_produtiva_id and 
    PU.produtor_id = :prodId
    `;

const withDbProdutor = withDb(QUERY_PRODUTOR, [(props) => props.match.params.produtorId], 'produtor');

const withUnidades = withDb(QUERY_UNIDADES, [(props) => props.match.params.produtorId], 'unidades');

// export default withDbProdutor(withUnidades(ProdutorPage));

export default connect({ signalSync: signal`app.sync` }, withDbProdutor(withUnidades(ProdutorPage)));
