import { form as Form } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
    Button,
    ComponentConnect,
    DropdownMaterial,
    DropdownMultipleMaterial,
    QueryDb,
    ShowElement,
    Spacer,
    TextInputMaterial,
} from '../../../components';

const styles = StyleSheet.create({
    scrollview: {
        flexGrow: 1,
    },
});

class PressaoSocialSubpage extends React.PureComponent {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onSalvarPress = () => {
        this.props.signalSalvar();
    };

    onDisabledPress = () => {
        this.props.touchForm({ form: 'unidProdutiva.formPressaoSocial' });
    };

    render() {
        const { form } = this.props;

        return (
            <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                <Spacer horizontal={4}>
                    <ComponentConnect path="unidProdutiva.formPressaoSocial.fl_pressao_social">
                        <DropdownMaterial
                            label="Sente pressões sociais e urbanas?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="unidProdutiva.formPressaoSocial.fl_pressao_social">
                        <QueryDb query={'select * from pressao_sociais WHERE deleted_at IS NULL'}>
                            {(data) => {
                                return (
                                    <ComponentConnect path="unidProdutiva.formPressaoSocial.pressaoSociais">
                                        <DropdownMultipleMaterial
                                            label="Pressões Sociais"
                                            data={data.map((v) => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

                        <ComponentConnect path="unidProdutiva.formPressaoSocial.pressao_social_descricao">
                            <TextInputMaterial label="Descrever pressões sociais e urbanas" />
                        </ComponentConnect>
                    </ShowElement>

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

        form: Form(state`unidProdutiva.formPressaoSocial`),

        signalSalvar: signal`unidProdutiva.salvarPressaoSocial`,
    },
    PressaoSocialSubpage
);
