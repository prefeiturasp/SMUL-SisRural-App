/* eslint-disable react-native/no-inline-styles */
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { getConnection, getRepository } from 'typeorm/browser';
import { Spacer, Text } from '../../../../components';
import UnidadeProdutivaResposta from '../../../../db/typeORM/UnidadeProdutivaRespostaModel';
import ButtonSelect from './buttonSelect/ButtonSelect';
import styles from './MultiplaEscolha.styles';

export async function applyChangesMultiplaEscolha(checklistUnidadeProdutiva, perguntaId, changes) {
    const repo = getRepository(UnidadeProdutivaResposta);

    for (let respostaId of changes.value) {
        let model = await repo.findOne({
            pergunta_id: perguntaId,
            unidade_produtiva_id: checklistUnidadeProdutiva.unidade_produtiva_id,
            resposta_id: respostaId,
        });

        if (!model) {
            model = repo.create({
                pergunta_id: perguntaId,
                unidade_produtiva_id: checklistUnidadeProdutiva.unidade_produtiva_id,
                resposta_id: respostaId,
            });
        }

        model.deleted_at = null;
        model.app_sync = 1;
        await repo.save(model);
    }

    await getConnection()
        .createQueryBuilder()
        .update(UnidadeProdutivaResposta)
        .set({ deleted_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), app_sync: 1 })
        .where(
            `pergunta_id = :perguntaId and unidade_produtiva_id = :UPid and resposta_id not in (${[
                -1,
                ...changes.value,
            ].join(',')})`,
            {
                perguntaId,
                UPid: checklistUnidadeProdutiva.unidade_produtiva_id,
            }
        )
        .execute();

    //    await repo.save(UPrespostaModel);
}

class MultiplaEscolha extends React.Component {
    static propTypes = {
        checklistPergunta: PropTypes.object.isRequired,
        unidadeProdutivaRespostas: PropTypes.array,
        readOnly: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = { value: props.unidadeProdutivaRespostas.map(v => v.resposta_id) };
    }

    onBtnPress = (resposta, checked) => {
        if (this.props.readOnly) {
            return;
        }
        let newState;

        if (checked) {
            newState = this.state.value.filter(v => {
                return v !== resposta.id;
            });
        } else {
            newState = [...this.state.value, resposta.id];
        }

        this.setState({
            value: newState,
        });
        this.props.onChange(newState);
    };

    renderRespostas = () => {
        const respostas = this.props.checklistPergunta.pergunta.respostas;

        return respostas.map((resposta, i) => {
            const checked = !!this.state.value.find(v => v === resposta.id);

            return (
                <View key={i} style={styles.btn}>
                    <ButtonSelect checked={checked} onPress={this.onBtnPress.bind(this, resposta, checked)}>
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
                    ESCOLHA AS RESPOSTAS
                </Text>
                <Spacer />
                <View style={styles.options}>{this.renderRespostas()}</View>
            </View>
        );
    }
}

export default MultiplaEscolha;
