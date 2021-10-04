/* eslint-disable react-native/no-inline-styles */
import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { getRepository } from 'typeorm/browser';
import { Button, Text } from '../../../../components/index.js';
import UnidadeProdutivaResposta from '../../../../db/typeORM/UnidadeProdutivaRespostaModel.js';
import styles from './Tabela.styles.js';

export async function applyChangesTabela(checklistUnidadeProdutiva, perguntaId, changes) {
    const repo = getRepository(UnidadeProdutivaResposta);
    let UPrespostaModel = await repo.findOne({
        pergunta_id: perguntaId,
        unidade_produtiva_id: checklistUnidadeProdutiva.unidade_produtiva_id,
    });

    if (!UPrespostaModel) {
        UPrespostaModel = repo.create({
            pergunta_id: perguntaId,
            unidade_produtiva_id: checklistUnidadeProdutiva.unidade_produtiva_id,
        });
    }
    // se já houver um registro, mesmo que deletado, remove o deleted_at
    UPrespostaModel.resposta = JSON.stringify(changes.value);
    UPrespostaModel.app_sync = 1;
    UPrespostaModel.deleted_at = null;

    await repo.save(UPrespostaModel);
}

class Tabela extends React.Component {
    static propTypes = {
        checklistPergunta: PropTypes.object.isRequired,
        unidadeProdutivaRespostas: PropTypes.array,
        readOnly: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        const unidadeProdutivaResposta = props.unidadeProdutivaRespostas && props.unidadeProdutivaRespostas[0];
        this.state = {
            value:
                unidadeProdutivaResposta && unidadeProdutivaResposta.resposta
                    ? JSON.parse(unidadeProdutivaResposta.resposta)
                    : {},
        };
    }

    componentDidMount() {
        const unidadeProdutivaResposta =
            this.props.unidadeProdutivaRespostas && this.props.unidadeProdutivaRespostas[0];

        //Inicia com uma linha
        if (!unidadeProdutivaResposta && !this.hasLineTitle() && !this.props.readOnly) {
            this.onNewLine();
        }
    }

    getColumnAndLines = () => {
        const { tabela_colunas, tabela_linhas } = this.props.checklistPergunta.pergunta;

        const columns = tabela_colunas ? tabela_colunas.split(',') : [];
        const lines = tabela_linhas ? tabela_linhas.split(',') : [];
        return { columns, lines };
    };

    renderHeader = () => {
        const { columns, lines } = this.getColumnAndLines();

        return (
            <View key="header" style={[styles.row, styles.header]}>
                {lines.length > 0 && (
                    <View style={[styles.cell, styles.headCell, styles.lineCell]}>
                        <Text style={[styles.text]}>{lines[0].toUpperCase()}</Text>
                    </View>
                )}

                {columns.map((column, c) => {
                    return (
                        <View key={c} style={[styles.cell, styles.headCell]}>
                            <Text style={[styles.text]}>{column.toUpperCase()}</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    onChange = (text, column, line) => {
        if (this.props.readOnly) {
            return;
        }

        //OBS - estou fazendo um shallow clone mas como o estado não é repassado
        // para filhos não há necessidade de usar imutabilidade...
        const data = { ...this.state.value };
        if (!data[column]) {
            data[column] = [];
        }
        data[column][line] = text;

        this.setState({ value: data });
        this.props.onChange(data);
    };

    onNewLine = () => {
        if (this.props.readOnly) {
            return;
        }

        const { columns } = this.getColumnAndLines();

        const data = { ...this.state.value };

        columns.forEach(key => {
            if (!data[key]) {
                data[key] = [];
            }
            data[key].push('');
        });

        // não precisa disparar onChange pois a linha está vazia
        this.setState({ value: data });
    };

    hasLineTitle = () => {
        let { lines } = this.getColumnAndLines();

        return lines.length > 0;
    };

    renderTable = () => {
        let { columns, lines } = this.getColumnAndLines();

        const hasLineTitle = this.hasLineTitle();

        if (!hasLineTitle) {
            lines = this.state.value[columns[0]];
        }

        if (!lines) {
            return null;
        }

        return lines.map((line, i) => {
            if (i === 0 && hasLineTitle) {
                return null;
            }
            return (
                <View key={i} style={styles.row}>
                    {hasLineTitle && (
                        <View style={[styles.cell, styles.lineCell]}>
                            <Text style={[styles.text]}>{line.toUpperCase()}</Text>
                        </View>
                    )}
                    {columns.map((column, j) => {
                        const lineNum = i - (hasLineTitle ? 1 : 0);
                        return (
                            <View style={[styles.cell]} key={j}>
                                <TextInput
                                    editable={!this.props.readOnly}
                                    style={styles.input}
                                    value={(
                                        (this.state.value[column] && this.state.value[column][lineNum]) ||
                                        ''
                                    ).toString()}
                                    onChangeText={txt => this.onChange(txt, column, lineNum)}
                                />
                            </View>
                        );
                    })}
                </View>
            );
        });
    };

    render() {
        return (
            <View>
                <ScrollView horizontal={true} persistentScrollbar={true}>
                    <View style={styles.table}>
                        {this.renderHeader()}
                        {this.renderTable()}
                    </View>
                </ScrollView>

                {!this.hasLineTitle() && !this.props.readOnly && (
                    <View key={'new'} style={styles.row}>
                        <Button onPress={this.onNewLine} icon="plus-circle" mode="text">
                            Adicionar nova linha
                        </Button>
                    </View>
                )}
            </View>
        );
    }
}

export default Tabela;
