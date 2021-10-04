import { Button, ComponentConnect, DropdownMaterial, Spacer, Text, TextInputMaterial } from '../../../components';
import { ScrollView, StyleSheet } from 'react-native';
import { signal, state } from 'cerebral/tags';

import React from 'react';
import { connect } from '@cerebral/react';
import { form } from '@cerebral/forms';

const styles = StyleSheet.create({
    scrollview: {
        flexGrow: 1,
    },
});

class CadastroBasicoSubpage extends React.PureComponent {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onSalvarPress = () => {
        this.props.signalSalvarCadastroBasico();
    };

    onDisabledPress = () => {
        this.props.touchForm({ form: 'produtor.formCadastroBasico' });
    };

    render() {
        const { formCadastroBasico } = this.props;

        return (
            <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                <Spacer horizontal={4}>
                    <ComponentConnect path="produtor.formCadastroBasico.nome">
                        <TextInputMaterial label="Nome Completo" />
                    </ComponentConnect>

                    <ComponentConnect path="produtor.formCadastroBasico.cpf">
                        <TextInputMaterial label="CPF" mask="999.999.999-99" keyboardType="numeric" maxLength={14} />
                    </ComponentConnect>

                    <ComponentConnect path="produtor.formCadastroBasico.telefone_1">
                        <TextInputMaterial
                            label="Telefone 1"
                            mask="99 999999999"
                            maxLength={13}
                            keyboardType="phone-pad"
                        />
                    </ComponentConnect>

                    <ComponentConnect path="produtor.formCadastroBasico.telefone_2">
                        <TextInputMaterial
                            label="Telefone 2"
                            mask="99 999999999"
                            maxLength={13}
                            keyboardType="phone-pad"
                        />
                    </ComponentConnect>

                    <ComponentConnect path={`produtor.formCadastroBasico.status`}>
                        <DropdownMaterial
                            label="Status"
                            data={[
                                { value: 'ativo', label: 'Ativo' },
                                { value: 'inativo', label: 'Inativo' },
                            ]}
                        />
                    </ComponentConnect>

                    <ComponentConnect path="produtor.formCadastroBasico.status_observacao">
                        <TextInputMaterial label="Status - Observação" />
                    </ComponentConnect>

                    <ComponentConnect path="produtor.formCadastroBasico.tags">
                        <TextInputMaterial label="Palavras Chaves" />
                    </ComponentConnect>

                    <Text greyBlue size12>
                        Insira as palavras, separando por vírgulas
                    </Text>

                    <Spacer vertical={2} />

                    <Button
                        mode="contained"
                        disabled={!formCadastroBasico.isValid}
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

        formCadastroBasico: form(state`produtor.formCadastroBasico`),

        signalSalvarCadastroBasico: signal`produtor.salvarCadastroBasico`,
    },
    CadastroBasicoSubpage
);
