import {
    ActionRoute,
    Button,
    CollapsibleContent,
    DownloadablePdfShareButton,
    HeaderMenu,
    QueryDb,
    Spacer,
    Text,
    Touchable,
} from '../../../components';
import ChecklistUnidadeProdutiva, {
    CUPFormatStatus,
    CUPFormatStatusFlow,
} from '../../../db/typeORM/ChecklistUnidadeProdutivaModel';
import { signal, state } from 'cerebral/tags';

import AnaliseChecklist from '../components/AnaliseChecklist';
import { BASE_URL } from 'react-native-dotenv';
import BuscaChecklistItem from '../buscaChecklist/components/buscaChecklistItem/BuscaChecklistItem';
import GerarPlanoAcaoButton from '../components/GerarPlanoAcaoButton';
import PropTypes from 'prop-types';
import React from 'react';
import ResultadoChecklist from '../components/ResultadoChecklist';
import { ScrollView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { compose } from 'recompose';
import { connect } from '@cerebral/react';
import { getRepository } from 'typeorm/browser';
import { makePromise } from '../../../utils/CerebralUtil';
import moment from 'moment';
import styles from './OverviewChecklistPage.styles';
import withData from '../../../db/typeORM/withModel';

// se tiver finalizado checklist_snapshot respostas
// unidade_produtiva_resposta

const QUERY_PERGUNTA_COUNT = `
SELECT
    count( distinct UR.pergunta_id ) as total
FROM
	unidade_produtiva_respostas UR,
	checklist_perguntas CP
WHERE
	UR.pergunta_id = CP.pergunta_id
AND CP.checklist_categoria_id = :categoriaId
AND UR.unidade_produtiva_id = :unidadeProdutivaId
AND UR.deleted_at IS NULL
AND CP.deleted_at IS NULL
`;

class OverviewChecklistPage extends React.Component {
    static propTypes = {
        checklistUnidadeProdutiva: PropTypes.any,
    };

    constructor(props) {
        super(props);
        this.state = { excluirLoading: false };
    }

    onCategoryPress = (categoria) => {
        ActionRoute.go(`/fillChecklist/${this.props.checklistUnidadeProdutiva.id}/${categoria.id}`);
    };

    componentDidMount() {
        const { promise, id } = makePromise();

        this.props.sync({ onComplete: id });

        promise.then((data) => {
            this.props.checklistUnidadeProdutivaRefresh();
        });
    }

    renderCategoria = (categoria) => {
        return (
            <Touchable onPress={this.onCategoryPress.bind(this, categoria)} style={styles.button} key={categoria.id}>
                <Spacer style={styles.buttonSpacer} vertical={3} horizontal={2}>
                    <Text style={styles.buttonName} darkGrey size16>
                        {categoria.nome}
                    </Text>
                    <QueryDb
                        returnFirst={true}
                        query={QUERY_PERGUNTA_COUNT}
                        params={[categoria.id, this.props.checklistUnidadeProdutiva.unidadeProdutiva.id]}
                    >
                        {(row) => {
                            return (
                                <Text darkGrey size16>
                                    {row.total}/{categoria.checklistPerguntas.length}
                                </Text>
                            );
                        }}
                    </QueryDb>
                </Spacer>
            </Touchable>
        );
    };

    onFinalizarPress = () => {
        if (!this.props.checklistUnidadeProdutiva.can_update) {
            return null;
        }

        const { promise, id } = makePromise();

        this.props.finalizar({
            checklistUnidadeProdutivaId: this.props.checklistUnidadeProdutiva.id,
            forceDownload: true,
            onComplete: id,
        });

        promise.then((data) => {
            this.props.checklistUnidadeProdutivaRefresh();
        });
    };

    onExcluirPress = () => {
        const { promise, id } = makePromise();

        this.setState({ excluirLoading: true });
        this.props.excluir({
            checklistUnidadeProdutivaId: this.props.checklistUnidadeProdutiva.id,
            forceDownload: true,
            onComplete: id,
        });

        promise.then((data) => {
            if (!data.removido) {
                this.setState({ excluirLoading: false });
            }
        });
    };

    onGerarPDAPress = async () => {
        const { checklistUnidadeProdutiva } = this.props;
        const { unidadeProdutiva, produtor } = checklistUnidadeProdutiva;

        checklistUnidadeProdutiva.app_sync = 1;
        await getRepository(ChecklistUnidadeProdutiva).save(checklistUnidadeProdutiva);

        ActionRoute.go(`/planoAcao/${unidadeProdutiva.id}/${produtor.id}/${checklistUnidadeProdutiva.id}`);
    };

    onHomePress = () => {
        ActionRoute.replace('/home');
    };

    render() {
        const { checklistUnidadeProdutiva, userId } = this.props;

        return (
            <View style={styles.root}>
                <View style={styles.header}>
                    <HeaderMenu title={'Formulário'} />
                    <BuscaChecklistItem
                        nome={checklistUnidadeProdutiva.checklist.nome}
                        produtor={checklistUnidadeProdutiva.produtor.nome}
                        unidadeProdutiva={checklistUnidadeProdutiva.unidadeProdutiva.nome}
                        criadoEm={
                            checklistUnidadeProdutiva.created_at
                                ? moment
                                      .utc(checklistUnidadeProdutiva.created_at)
                                      .local()
                                      .format('DD/MM/YYYY \\à\\s HH:mm')
                                : null
                        }
                        atualizadoEm={
                            checklistUnidadeProdutiva.updated_at
                                ? moment
                                      .utc(checklistUnidadeProdutiva.updated_at)
                                      .local()
                                      .format('DD/MM/YYYY \\à\\s HH:mm')
                                : null
                        }
                        finalizadoEm={
                            checklistUnidadeProdutiva.finished_at
                                ? moment
                                      .utc(checklistUnidadeProdutiva.finished_at)
                                      .local()
                                      .format('DD/MM/YYYY \\à\\s HH:mm')
                                : null
                        }
                        finalizadoPor={
                            checklistUnidadeProdutiva.finishUser
                                ? checklistUnidadeProdutiva.finishUser.first_name +
                                  ' ' +
                                  checklistUnidadeProdutiva.finishUser.last_name
                                : null
                        }
                        status={CUPFormatStatus(checklistUnidadeProdutiva.status)}
                        statusFlow={CUPFormatStatusFlow(checklistUnidadeProdutiva.status_flow)}
                    />
                </View>
                <ScrollView style={styles.scrollview} contentContainerStyle={styles.content}>
                    {!!checklistUnidadeProdutiva.checklist && !!checklistUnidadeProdutiva.checklist.instrucoes && (
                        <Spacer horizontal={0} vertical={2} style={styles.box}>
                            <CollapsibleContent
                                collapsed={false}
                                header={
                                    <Text size18 fontBold slateGrey>
                                        Instruções Gerais
                                    </Text>
                                }
                            >
                                <Spacer horizontal={4} bottom={4} top={0}>
                                    <Text size14 slateGrey>
                                        {checklistUnidadeProdutiva.checklist.instrucoes}
                                    </Text>
                                </Spacer>
                            </CollapsibleContent>
                        </Spacer>
                    )}

                    <Spacer horizontal={0} vertical={4}>
                        {checklistUnidadeProdutiva.checklist.categorias
                            .filter((v) => v.checklistPerguntas.length > 0)
                            .map(this.renderCategoria)}

                        {!!checklistUnidadeProdutiva.checklist.fl_gallery && (
                            <Touchable
                                onPress={() => {
                                    ActionRoute.go('/arquivosChecklist/' + checklistUnidadeProdutiva.id);
                                }}
                                style={styles.button}
                            >
                                <Spacer style={styles.buttonSpacer} vertical={3} horizontal={2}>
                                    <Text style={styles.buttonName} darkGrey size16>
                                        Fotos e Anexos
                                    </Text>
                                </Spacer>
                            </Touchable>
                        )}

                        {checklistUnidadeProdutiva.status === 'finalizado' &&
                            checklistUnidadeProdutiva.checklist.tipo_pontuacao != 'sem_pontuacao' && (
                                <ResultadoChecklist checklistUnidadeProdutivaId={checklistUnidadeProdutiva.id} />
                            )}

                        <AnaliseChecklist checklistUnidadeProdutivaId={checklistUnidadeProdutiva.id} />
                    </Spacer>

                    <View>
                        {checklistUnidadeProdutiva.status === 'rascunho' && checklistUnidadeProdutiva.can_update && (
                            <>
                                <Button mode="contained" onPress={this.onFinalizarPress}>
                                    FINALIZAR FORMULÁRIO
                                </Button>
                                <Spacer />
                            </>
                        )}

                        <GerarPlanoAcaoButton
                            permiteCriacao={checklistUnidadeProdutiva.can_update}
                            checklistUnidadeProdutivaId={checklistUnidadeProdutiva.id}
                            onGerarPress={this.onGerarPDAPress}
                        />

                        {checklistUnidadeProdutiva.created_at && (
                            <DownloadablePdfShareButton
                                url={`${BASE_URL}/formulario_unidade_produtiva/pdf/${checklistUnidadeProdutiva.id}/${userId}`}
                                pdfFileName="plano.pdf"
                            />
                        )}

                        <QueryDb
                            query={
                                'select * from plano_acoes where checklist_unidade_produtiva_id = :checklist_unidade_produtiva_id'
                            }
                            params={[checklistUnidadeProdutiva.id]}
                            supressError
                            returnFirst
                        >
                            {(data) => {
                                if (!data) {
                                    return null;
                                }

                                return (
                                    <>
                                        <Button
                                            mode="contained"
                                            onPress={() => ActionRoute.go(`/planoAcao/${data.id}`)}
                                        >
                                            VER PLANO DE AÇÃO
                                        </Button>
                                        <Spacer />
                                    </>
                                );
                            }}
                        </QueryDb>

                        <Button mode="contained" onPress={this.onHomePress}>
                            VOLTAR PARA TELA INICIAL
                        </Button>

                        <Spacer vertical={2} />
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const composed = compose(
    withData(async (props) => {
        const id = props.match.params.checklistUnidadeProdutiva;

        const repo = getRepository(ChecklistUnidadeProdutiva);

        const data = await repo
            .createQueryBuilder('CUP')
            .leftJoinAndSelect('CUP.checklist', 'checklist')
            .leftJoinAndSelect('CUP.produtor', 'produtor')
            .leftJoinAndSelect('CUP.unidadeProdutiva', 'unidadeProdutiva')
            .leftJoinAndSelect('checklist.categorias', 'categorias')
            .leftJoinAndSelect('categorias.checklistPerguntas', 'checklistPerguntas')
            .leftJoinAndSelect('checklistPerguntas.pergunta', 'pergunta')
            .leftJoinAndSelect('pergunta.respostas', 'respostas')
            .leftJoinAndSelect('CUP.finishUser', 'finishUser')
            .where(
                `
            CUP.id = :id and 
            CUP.deleted_at is null and
            categorias.deleted_at is null and
            checklistPerguntas.deleted_at is null and
            pergunta.deleted_at is null and
            respostas.deleted_at is null
            `,
                { id: id }
            )
            .orderBy('categorias.ordem', 'ASC')
            .getOne();

        if (!data) {
            const dataDeleted = await repo.findOne(id);
            if (dataDeleted) {
                ActionRoute.replace(
                    `/cadastroChecklist/${dataDeleted.checklist_id}/${dataDeleted.unidade_produtiva_id}/${dataDeleted.produtor_id}`
                );
            } else {
                ActionRoute.replace('/home');
            }
        }

        return data;
    }, 'checklistUnidadeProdutiva')
)((props) => {
    return <OverviewChecklistPage {...props} />;
});

export default connect(
    {
        userId: state`auth.user.id`,
        finalizar: signal`checklist.finalizar`,
        excluir: signal`checklist.excluir`,
        sync: signal`checklist.sync`,
    },
    composed
);
