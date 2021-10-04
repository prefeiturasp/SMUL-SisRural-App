/* eslint-disable react-native/no-inline-styles */
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { getRepository } from 'typeorm/browser';
import { Spacer, Text } from '../../../../components';
import UnidadeProdutivaResposta from '../../../../db/typeORM/UnidadeProdutivaRespostaModel';
import ButtonSelect from './buttonSelect/ButtonSelect';
import styles from './Semaforica.styles';

const COLORS = {
    verde: '#77d662',
    amarelo: '#fee07e',
    vermelho: '#ff9ea0',
    cinza: '#e4e7eb',
};

export async function applyChangesSemaforica(checklistUnidadeProdutiva, perguntaId, changes) {
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
    UPrespostaModel.resposta_id = changes.value;
    UPrespostaModel.app_sync = 1;
    UPrespostaModel.deleted_at = null;

    await repo.save(UPrespostaModel);
}

class Semaforica extends React.Component {
    static propTypes = {
        checklistPergunta: PropTypes.object.isRequired,
        unidadeProdutivaRespostas: PropTypes.array,
        readOnly: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        const unidadeProdutivaResposta = props.unidadeProdutivaRespostas && props.unidadeProdutivaRespostas[0];
        this.state = { value: unidadeProdutivaResposta ? unidadeProdutivaResposta.resposta_id : null };
    }

    onBtnPress = resposta => {
        if (this.props.readOnly) {
            return;
        }
        if (resposta.id === this.state.value) {
            return;
        }
        this.setState({ value: resposta.id });
        this.props.onChange(resposta.id);
    };

    renderRespostas = () => {
        const respostas = this.props.checklistPergunta.pergunta.respostas;

        return respostas.map((resposta, i) => {
            return (
                <View key={i} style={[styles.btn]}>
                    <ButtonSelect
                        key={i}
                        checked={this.state.value === resposta.id}
                        icon={
                            resposta.cor && (
                                <View
                                    style={{
                                        width: 10,
                                        height: 22,
                                        backgroundColor: COLORS[resposta.cor],
                                    }}
                                />
                            )
                        }
                        onPress={this.onBtnPress.bind(this, resposta)}
                    >
                        {resposta.descricao}
                    </ButtonSelect>
                </View>
            );
        });
    };

    render() {
        return (
            <View>
                <Spacer vertical={2} />

                <Text greyBlue fontBold size12>
                    {this.props.readOnly ? 'RESPOSTA INFORMADA' : 'ESCOLHA A RESPOSTA'}
                </Text>

                <Spacer />

                <View style={styles.options}>{this.renderRespostas()}</View>
            </View>
        );
    }
}

export default Semaforica;
