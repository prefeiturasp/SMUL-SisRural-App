import {
    Button,
    ComponentConnect,
    DropdownMaterial,
    DropdownMultipleMaterial,
    QueryDb,
    ShowElement,
    Spacer,
    Text,
    TextInputMaterial,
} from '../../../components';
import { ScrollView, StyleSheet } from 'react-native';
import { signal, state } from 'cerebral/tags';

import { form as Form } from '@cerebral/forms';
import React from 'react';
import { connect } from '@cerebral/react';

const styles = StyleSheet.create({
    scrollview: {
        flexGrow: 1,
    },
});

class DadosComplementaresSubpage extends React.PureComponent {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onSalvarPress = () => {
        this.props.signalSalvar();
    };

    onDisabledPress = () => {
        this.props.touchForm({ form: 'unidProdutiva.formDadosComplementares' });
    };

    render() {
        const { form } = this.props;

        return (
            <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                <Spacer horizontal={4}>
                    <ComponentConnect path="unidProdutiva.formDadosComplementares.fl_certificacoes">
                        <DropdownMaterial
                            label="Possui Certificação?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="unidProdutiva.formDadosComplementares.fl_certificacoes">
                        <QueryDb query={'select * from certificacoes WHERE deleted_at IS NULL'}>
                            {(data) => {
                                return (
                                    <ComponentConnect path="unidProdutiva.formDadosComplementares.certificacoes">
                                        <DropdownMultipleMaterial
                                            label="Certificações"
                                            data={data.map((v) => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

                        <ComponentConnect path="unidProdutiva.formDadosComplementares.certificacoes_descricao">
                            <TextInputMaterial label="Caso a resposta seja outros, qual certificação?" />
                        </ComponentConnect>
                    </ShowElement>

                    <ComponentConnect path="unidProdutiva.formDadosComplementares.fl_car">
                        <DropdownMaterial
                            label="Possui CAR?"
                            data={[
                                {
                                    label: 'Sem resposta',
                                    value: null,
                                },
                                {
                                    label: 'Sim',
                                    value: 'sim',
                                },
                                {
                                    label: 'Não',
                                    value: 'nao',
                                },
                                {
                                    label: 'Não se aplica',
                                    value: 'nao_se_aplica',
                                },
                            ]}
                        />
                    </ComponentConnect>

                    <ComponentConnect path="unidProdutiva.formDadosComplementares.car">
                        <TextInputMaterial label="CAR" keyboardType="numeric" />
                    </ComponentConnect>

                    <ComponentConnect path="unidProdutiva.formDadosComplementares.fl_ccir">
                        <DropdownMaterial
                            label="Possui CCIR?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ComponentConnect path="unidProdutiva.formDadosComplementares.fl_itr">
                        <DropdownMaterial
                            label="Possui ITR?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ComponentConnect path="unidProdutiva.formDadosComplementares.fl_matricula">
                        <DropdownMaterial
                            label="Possui Matricula?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ComponentConnect path="unidProdutiva.formDadosComplementares.upa">
                        <TextInputMaterial label="Número da UPA" keyboardType="numeric" />
                    </ComponentConnect>

                    <Text greyBlue size12>
                        Informação de Cadastro Estadual. Não preencher.
                    </Text>

                    <Spacer vertical={2} />

                    <Button
                        mode="contained"
                        disabled={!form.isValid}
                        onPress={this.onSalvarPress}
                        onDisabledPress={this.onDisabledPress}
                    >
                        SALVAR E CONTINUAR
                    </Button>

                    <Spacer vertical={2} />
                </Spacer>
            </ScrollView>
        );
    }
}

export default connect(
    {
        touchForm: signal`form.touchForm`,

        form: Form(state`unidProdutiva.formDadosComplementares`),

        signalSalvar: signal`unidProdutiva.salvarDadosComplementares`,
    },
    DadosComplementaresSubpage
);
