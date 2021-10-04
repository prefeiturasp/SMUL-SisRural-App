import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import PropTypes from 'prop-types';
import React from 'react';
import {
    DropdownMaterial,
    DropdownMultipleMaterial,
    Spacer,
    TextAreaMaterial,
    TextInputMaterial,
} from '../../../components';
import DetachedTabBar from '../../../components/tabViewMaterial/DetachedTabBar';

class InformacoesSubPage extends React.Component {
    static propTypes = {
        permiteAlterar: PropTypes.bool,
    };

    renderCheck(pergunta, disabled = false) {
        const value = this.props.respostas[pergunta.id] || { type: 'check', value: undefined };
        return (
            <DropdownMaterial
                onChangeText={text => {
                    this.props.signalSetResposta({
                        value: { value: text, type: 'check' },
                        perguntaId: pergunta.id,
                    });
                }}
                disabled={disabled}
                value={(value && value.value) || undefined}
                key={pergunta.id}
                label={pergunta.pergunta}
                data={(pergunta.respostas || []).map(v => {
                    return { value: v.id, label: v.descricao };
                })}
            />
        );
    }

    renderMultipleCheck(pergunta, disabled = false) {
        const value = this.props.respostas[pergunta.id] || { type: 'multiple_check', value: undefined };
        return (
            <DropdownMultipleMaterial
                onChangeText={text => {
                    this.props.signalSetResposta({
                        value: { value: text, type: 'multiple_check' },
                        perguntaId: pergunta.id,
                    });
                }}
                disabled={disabled}
                value={(value && value.value) || undefined}
                key={pergunta.id}
                label={pergunta.pergunta}
                data={(pergunta.respostas || []).map(v => {
                    return { value: v.id, label: v.descricao };
                })}
            />
        );
    }

    renderText(pergunta, disabled = false) {
        const value = this.props.respostas[pergunta.id] || { type: 'text', value: '' };

        return (
            <TextAreaMaterial
                onChangeText={text => {
                    this.props.signalSetResposta({
                        value: { value: text, type: 'text' },
                        perguntaId: pergunta.id,
                    });
                }}
                multiline={true}
                disabled={disabled}
                key={pergunta.id}
                value={value.value}
                label={pergunta.pergunta}
            />
        );
    }

    renderPerguntas() {
        const disabled = this.props.caderno.status === 'finalizado' || !this.props.permiteAlterar;

        return this.props.perguntas.map(pergunta => {
            if (pergunta.tipo === 'check') {
                return this.renderCheck(pergunta, disabled);
            } else if (pergunta.tipo === 'text') {
                return this.renderText(pergunta, disabled);
            } else if (pergunta.tipo === 'multiple_check') {
                return this.renderMultipleCheck(pergunta, disabled);
            } else {
                throw new Error('Unhandled pergunta type ' + pergunta.tipo);
            }
        });
    }
    
    render() {
        const { produtor, unidadeProdutiva } = this.props;

        if (!produtor || !unidadeProdutiva) {
            return <Spacer />;
        }

        return (
            <Spacer horizontal={4}>
                <DetachedTabBar>INFORMAÇÕES</DetachedTabBar>

                <TextInputMaterial disabled value={this.props.produtor.nome} label="Nome do Produtor/a" />

                <TextInputMaterial disabled value={this.props.unidadeProdutiva.nome} label="Unidade Produtiva" />

                {this.renderPerguntas()}
            </Spacer>
        );
    }
}

export default connect(
    {
        caderno: state`cadernoCampo.cadernoData`,
        produtor: state`cadernoCampo.produtorData`,
        unidadeProdutiva: state`cadernoCampo.unidadeProdutivaData`,
        perguntas: state`cadernoCampo.perguntasData`,
        signalSetResposta: signal`cadernoCampo.setResposta`,
        respostas: state`cadernoCampo.respostas`,
    },
    InformacoesSubPage
);
