import PropTypes from 'prop-types';
import React from 'react';
import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Spacer, ViewSmart } from '../../../components';
import styles from './FillForm.styles';
import Anexo from './questions/Anexo';
import MultiplaEscolha from './questions/MultiplaEscolha';
import Semaforica from './questions/Semaforica';
import Tabela from './questions/Tabela';
import Texto from './questions/Texto';

const TYPES = {
    semaforica: Semaforica,
    'semaforica-cinza': Semaforica,
    binaria: Semaforica,
    'binaria-cinza': Semaforica,
    'escolha-simples': Semaforica,
    'escolha-simples-pontuacao': Semaforica,
    'escolha-simples-pontuacao-cinza': Semaforica,
    'numerica-pontuacao': Texto,
    numerica: Texto,
    texto: Texto,
    'multipla-escolha': MultiplaEscolha,
    tabela: Tabela,
    anexo: Anexo,
};

export default class FillForm extends React.Component {
    static propTypes = {
        categoria: PropTypes.object.isRequired,
        unidadeProdutivaRespostas: PropTypes.array,
        onNextTab: PropTypes.func,
        readOnly: PropTypes.bool.isRequired,
    };

    onChange = (checklistPergunta, value, extraData) => {
        this.props.onChange(checklistPergunta, value, extraData);
    };

    renderPerguntas() {
        const { checklistPerguntas } = this.props.categoria;

        const total = checklistPerguntas.length;
        return checklistPerguntas.map((checklistPergunta, i) => {
            const PerguntaType = TYPES[checklistPergunta.pergunta.tipo_pergunta] || View;

            const unidadeProdutivaRespostas = this.props.unidadeProdutivaRespostas.filter(
                v => v.pergunta_id === checklistPergunta.pergunta_id
            );

            return (
                <View key={i} style={styles.block}>
                    <Spacer vertical={2} horizontal={2}>
                        <ViewSmart row>
                            <Text style={styles.question}>{checklistPergunta.pergunta.pergunta}</Text>

                            <Text style={[styles.title, styles.titleCount]}>
                                {i + 1}/{total} {checklistPergunta.fl_obrigatorio ? '*' : ''}
                            </Text>
                        </ViewSmart>

                        {styles.questionExtra && (
                            <Text style={styles.questionExtra}>{checklistPergunta.pergunta.texto_apoio}</Text>
                        )}

                        <Spacer vertical={1} />

                        <PerguntaType
                            readOnly={this.props.readOnly}
                            unidadeProdutivaRespostas={unidadeProdutivaRespostas}
                            checklistPergunta={checklistPergunta}
                            onChange={(value, extraData) => {
                                this.onChange(checklistPergunta, value, extraData);
                            }}
                        />
                    </Spacer>
                </View>
            );
        });
    }

    render() {
        return (
            <ScrollView>
                <Spacer vertical={4} horizontal={4}>
                    {this.renderPerguntas()}

                    <ViewSmart row spaceBetween>
                        {this.props.onPrevTab && (
                            <Spacer vertical={1} horizontal={0}>
                                <Button onPress={this.props.onPrevTab}>ANTERIOR</Button>
                            </Spacer>
                        )}

                        <Spacer vertical={0} horizontal={2} />

                        {this.props.onNextTab && (
                            <Spacer vertical={1} horizontal={0}>
                                <Button onPress={this.props.onNextTab}>AVANÇAR</Button>
                            </Spacer>
                        )}
                    </ViewSmart>
                </Spacer>
            </ScrollView>
        );
    }
}
