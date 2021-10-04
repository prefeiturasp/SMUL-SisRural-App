import { Spacer, Text, TextInputMaterial } from '../../../../components';

import PropTypes from 'prop-types';
import React from 'react';
import UnidadeProdutivaResposta from '../../../../db/typeORM/UnidadeProdutivaRespostaModel';
import { View } from 'react-native';
import { getRepository } from 'typeorm/browser';

const KEYBOARD_TYPE = {
    'numerica-pontuacao': 'numeric',
    numerica: 'numeric',
};

export async function applyChangesTexto(checklistUnidadeProdutiva, perguntaId, changes) {
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
    UPrespostaModel.resposta = changes.value;
    UPrespostaModel.app_sync = 1;
    UPrespostaModel.deleted_at = null;

    await repo.save(UPrespostaModel);
}

export default class Texto extends React.Component {
    static propTypes = {
        checklistPergunta: PropTypes.object.isRequired,
        unidadeProdutivaRespostas: PropTypes.array,
        readOnly: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        const unidadeProdutivaResposta = props.unidadeProdutivaRespostas && props.unidadeProdutivaRespostas[0];
        this.state = { value: unidadeProdutivaResposta ? unidadeProdutivaResposta.resposta + '' : '' };
    }

    formatNumber = num => {
        if (num === '.') {
            return '';
        }
        let match = num.match(/^[^.]*\.|[^.]+/g);
        num = match ? match.join('') : '';

        match = num.toString().match(/[0-9]|\./g);
        return match ? match.join('') : '';
    };

    format = v => {
        const { tipo_pergunta } = this.props.checklistPergunta.pergunta;

        if (tipo_pergunta === 'numerica' || tipo_pergunta === 'numerica-pontuacao') {
            return this.formatNumber(v);
        }
        return v;
    };

    onChange = value => {
        if (this.props.readOnly) {
            return;
        }
        value = this.format(value);

        if (this.state.value !== value) {
            this.props.onChange(value);
        }
        this.setState({ value });
    };

    render() {
        const { tipo_pergunta } = this.props.checklistPergunta.pergunta;

        return (
            <View>
                <Spacer vertical={2} />
                <Text greyBlue fontBold size12>
                    {this.props.readOnly ? 'RESPOSTA INFORMADA' : ''}
                </Text>

                <View>
                    <TextInputMaterial
                        onChangeText={this.onChange}
                        value={this.state.value}
                        multiline={tipo_pergunta === 'texto'}
                        keyboardType={KEYBOARD_TYPE[tipo_pergunta] || 'default'}
                        label="Resposta"
                        disabled={this.props.readOnly}
                    />
                </View>
            </View>
        );
    }
}
