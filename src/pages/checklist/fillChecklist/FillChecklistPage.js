import { ActionRoute, Button, HeaderMenu, Spacer, TabViewMaterial } from '../../../components';
import ChecklistUnidadeProdutiva, {
    ChecklistUnidadeProdutivaStatus,
} from '../../../db/typeORM/ChecklistUnidadeProdutivaModel';
import { In, IsNull, getRepository } from 'typeorm/browser';

import ChecklistSnapshotRespostas from '../../../db/typeORM/ChecklistSnapshotResposta';
import FillForm from './FillForm';
import Pergunta from '../../../db/typeORM/PerguntaModel';
import PropTypes from 'prop-types';
import React from 'react';
import { SceneMap } from 'react-native-tab-view';
import UnidadeProdutivaResposta from '../../../db/typeORM/UnidadeProdutivaRespostaModel';
import { View } from 'react-native';
import { applyChangesAnexo } from './questions/Anexo';
import { applyChangesMultiplaEscolha } from './questions/MultiplaEscolha';
import { applyChangesSemaforica } from './questions/Semaforica';
import { applyChangesTabela } from './questions/Tabela';
import { applyChangesTexto } from './questions/Texto';
import { compose } from 'recompose';
import { connect } from '@cerebral/react';
import findIndex from 'lodash/findIndex';
import { signal } from 'cerebral/tags';
import styles from './FillChecklistPage.styles';
import withData from '../../../db/typeORM/withModel';

// se tiver finalizado checklist_snapshot respostas
// unidade_produtiva_resposta

const APPLY_CHANGES = {
    semaforica: applyChangesSemaforica,
    'semaforica-cinza': applyChangesSemaforica,
    binaria: applyChangesSemaforica,
    'binaria-cinza': applyChangesSemaforica,
    'escolha-simples': applyChangesSemaforica,
    'escolha-simples-pontuacao': applyChangesSemaforica,
    'escolha-simples-pontuacao-cinza': applyChangesSemaforica,
    'numerica-pontuacao': applyChangesTexto,
    numerica: applyChangesTexto,
    texto: applyChangesTexto,
    'multipla-escolha': applyChangesMultiplaEscolha,
    tabela: applyChangesTabela,
    anexo: applyChangesAnexo,
};

class FillChecklistPage extends React.Component {
    static propTypes = {
        initialCategoria: PropTypes.any.isRequired,
        checklistUnidadeProdutiva: PropTypes.any.isRequired,
        unidadeProdutivaRespostas: PropTypes.array,
    };

    renderScene = null;

    changes = {};

    constructor(props) {
        super(props);
        const categorias = props.checklistUnidadeProdutiva.checklist.categorias.filter(
            (v) => v.checklistPerguntas.length > 0
        );

        this.routes = categorias
            .map((categoria) => {
                return {
                    key: categoria.id,
                    title: categoria.nome.toUpperCase(),
                };
            });

        this.renderScene = SceneMap(
            categorias
                .reduce((acc, categoria, i) => {
                    acc[categoria.id] = () => {
                        return (
                            <FillForm
                                readOnly={
                                    this.props.checklistUnidadeProdutiva.status !==
                                        ChecklistUnidadeProdutivaStatus.rascunho ||
                                    !this.props.checklistUnidadeProdutiva.can_update
                                }
                                unidadeProdutivaRespostas={this.props.unidadeProdutivaRespostas}
                                categoria={categoria}
                                key={categoria.id}
                                onNextTab={i === categorias.length - 1 ? null : this.onNextTab}
                                onPrevTab={i === 0 ? null : this.onPrevTab}
                                onChange={this.onChange}
                            />
                        );
                    };
                    return acc;
                }, {})
        );

        this.state = { index: this.getIndex(props.initialCategoria) };
    }

    onChange = (checklistPergunta, value, extraData) => {
        if (
            this.props.checklistUnidadeProdutiva.status !== ChecklistUnidadeProdutivaStatus.rascunho ||
            !this.props.checklistUnidadeProdutiva.can_update
        ) {
            return;
        }

        this.changes[checklistPergunta.pergunta_id] = {
            value,
            extraData,
        };
    };

    onNextTab = () => {
        this.setState({ index: this.state.index + 1 });
    };
    onPrevTab = () => {
        this.setState({ index: this.state.index - 1 });
    };

    getIndex = (id) => {
        return findIndex(this.routes, (route) => {
            return route.key.toString() === id.toString();
        });
    };
    onIndexChange = (i) => {
        this.setState({ index: i });
    };

    onBack = () => {
        ActionRoute.replace(`/editarChecklist/${this.props.checklistUnidadeProdutiva.id}`);
    };

    onSave = async () => {
        if (
            this.props.checklistUnidadeProdutiva.status !== ChecklistUnidadeProdutivaStatus.rascunho ||
            !this.props.checklistUnidadeProdutiva.can_update
        ) {
            return;
        }

        const changes = this.changes;

        const changesIds = Object.keys(changes);

        const perguntaRepo = getRepository(Pergunta);

        this.props.checklistUnidadeProdutiva.app_sync = 1;

        await getRepository(ChecklistUnidadeProdutiva).save(this.props.checklistUnidadeProdutiva);

        for (let perguntaId of changesIds) {
            const perguntaModel = await perguntaRepo.findOne(perguntaId);

            await APPLY_CHANGES[perguntaModel.tipo_pergunta](
                this.props.checklistUnidadeProdutiva,
                perguntaId,
                changes[perguntaId]
            );
        }

        this.props.signalSyncRespostasChecklistComItemPDA({
            checklistUnidadeProdutivaId: this.props.checklistUnidadeProdutiva.id,
        });

        this.onBack();
    };

    render() {
        return (
            <View style={styles.root}>
                <View style={styles.header}>
                    <HeaderMenu title={'Formulário'} />
                </View>

                <TabViewMaterial
                    lazy
                    navigationState={{
                        index: this.state.index,
                        routes: this.routes,
                    }}
                    onIndexChange={this.onIndexChange}
                    renderScene={this.renderScene}
                />

                <View style={styles.footer}>
                    <Spacer vertical={4} horizontal={4}>
                        {this.props.checklistUnidadeProdutiva.status === ChecklistUnidadeProdutivaStatus.rascunho &&
                            this.props.checklistUnidadeProdutiva.can_update && (
                                <Button mode="contained" onPress={this.onSave}>
                                    SALVAR E VOLTAR
                                </Button>
                            )}

                        {(this.props.checklistUnidadeProdutiva.status !== ChecklistUnidadeProdutivaStatus.rascunho ||
                            !this.props.checklistUnidadeProdutiva.can_update) && (
                            <Button mode="contained" onPress={this.onBack}>
                                VOLTAR
                            </Button>
                        )}
                    </Spacer>
                </View>
            </View>
        );
    }
}

const composed = compose(
    withData(async (props) => {
        const data = await getRepository(ChecklistUnidadeProdutiva)
            .createQueryBuilder('CUP')
            .leftJoinAndSelect('CUP.checklist', 'checklist')
            .leftJoinAndSelect('CUP.produtor', 'produtor')
            .leftJoinAndSelect('CUP.unidadeProdutiva', 'unidadeProdutiva')
            .leftJoinAndSelect('checklist.categorias', 'categorias')
            .leftJoinAndSelect('categorias.checklistPerguntas', 'checklistPerguntas')
            .leftJoinAndSelect('checklistPerguntas.pergunta', 'pergunta')
            .leftJoinAndSelect('pergunta.respostas', 'respostas')
            .where(
                `
            CUP.id = :id and 
            CUP.deleted_at is null and
            categorias.deleted_at is null and
            checklistPerguntas.deleted_at is null and
            pergunta.deleted_at is null and
            respostas.deleted_at is null
            `,
                { id: props.match.params.checklistUnidadeProdutiva }
            )
            .orderBy({ 'categorias.ordem': 'ASC', 'checklistPerguntas.ordem': 'ASC', 'respostas.ordem': 'ASC' })
            .getOne();

        return data;
    }, 'checklistUnidadeProdutiva'),
    withData(async (props) => {
        const perguntasIds = props.checklistUnidadeProdutiva.checklist.categorias
            .map((cat) => cat.checklistPerguntas.map((v) => v.pergunta_id))
            .flat();

        // se estiver finalizado
        if (
            props.checklistUnidadeProdutiva.status === ChecklistUnidadeProdutivaStatus.finalizado ||
            props.checklistUnidadeProdutiva.status === ChecklistUnidadeProdutivaStatus.cancelado
        ) {
            return await getRepository(ChecklistSnapshotRespostas).find({
                relations: ['respostaModel', 'pergunta', 'pergunta.respostas'],
                where: {
                    checklist_unidade_produtiva_id: props.checklistUnidadeProdutiva.id,
                    deleted_at: IsNull(),
                    pergunta_id: In(perguntasIds),
                },
            });
        } else {
            return await getRepository(UnidadeProdutivaResposta).find({
                relations: ['respostaModel', 'pergunta', 'pergunta.respostas'],
                where: {
                    unidade_produtiva_id: props.checklistUnidadeProdutiva.unidade_produtiva_id,
                    deleted_at: IsNull(),
                    pergunta_id: In(perguntasIds),
                },
            });
        }
    }, 'unidadeProdutivaRespostas')
)((props) => {
    return <FillChecklistPage initialCategoria={props.match.params.checklistCategoria} {...props} />;
});

export default connect(
    { signalSyncRespostasChecklistComItemPDA: signal`checklist.syncRespostasChecklistComItemPDA` },
    composed
);
