import { form as Form } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
    Button,
    DropdownMaterial,
    ComponentConnect,
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

class ComercializacaoSubpage extends React.PureComponent {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onSalvarPress = () => {
        this.props.signalSalvar();
    };

    onDisabledPress = () => {
        this.props.touchForm({ form: 'unidProdutiva.formComercializacao' });
    };

    render() {
        const { form } = this.props;

        return (
            <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                <Spacer horizontal={4}>
                    <ComponentConnect path="unidProdutiva.formComercializacao.fl_comercializacao">
                        <DropdownMaterial
                            label="Sente pressões sociais e urbanas?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="unidProdutiva.formComercializacao.fl_comercializacao">
                        <QueryDb query={'select * from canal_comercializacoes WHERE deleted_at IS NULL'}>
                            {(data) => {
                                return (
                                    <ComponentConnect path="unidProdutiva.formComercializacao.canaisComercializacao">
                                        <DropdownMultipleMaterial
                                            label="Selecione os Canais de Comercialização"
                                            data={data.map((v) => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

                        <ComponentConnect path="unidProdutiva.formComercializacao.gargalos">
                            <TextInputMaterial label="Gargalos da produção, processamento e comercialização" />
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

        form: Form(state`unidProdutiva.formComercializacao`),

        signalSalvar: signal`unidProdutiva.salvarComercializacao`,
    },
    ComercializacaoSubpage
);
