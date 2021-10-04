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

class AguaSubpage extends React.PureComponent {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onSalvarPress = () => {
        this.props.signalSalvar();
    };

    onDisabledPress = () => {
        this.props.touchForm({ form: 'unidProdutiva.formAgua' });
    };

    render() {
        const { form } = this.props;

        return (
            <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                <Spacer horizontal={4}>
                    <QueryDb query={'select * from outorgas WHERE deleted_at IS NULL'}>
                        {(data) => {
                            return (
                                <ComponentConnect path="unidProdutiva.formAgua.outorga_id">
                                    <DropdownMaterial
                                        label="Possui Outorga?"
                                        data={data.map((v) => {
                                            return { value: v.id, label: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <QueryDb query={'select * from tipo_fonte_aguas WHERE deleted_at IS NULL'}>
                        {(data) => {
                            return (
                                <ComponentConnect path="unidProdutiva.formAgua.tiposFonteAgua">
                                    <DropdownMultipleMaterial
                                        label="Fontes de uso de Água"
                                        data={data.map((v) => {
                                            return { value: v.id, label: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <ComponentConnect path="unidProdutiva.formAgua.fl_risco_contaminacao">
                        <DropdownMaterial
                            label="Há Risco de Contaminação?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="unidProdutiva.formAgua.fl_risco_contaminacao">
                        <QueryDb query={'select * from risco_contaminacao_aguas WHERE deleted_at IS NULL'}>
                            {(data) => {
                                return (
                                    <ComponentConnect path="unidProdutiva.formAgua.riscosContaminacaoAgua">
                                        <DropdownMultipleMaterial
                                            label="Selecione os Tipos de Contaminação"
                                            data={data.map((v) => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

                        <ComponentConnect path="unidProdutiva.formAgua.risco_contaminacao_observacoes">
                            <TextInputMaterial label="Observações quanto à contaminação" />
                        </ComponentConnect>
                    </ShowElement>

                    <QueryDb query={'select * from residuo_solidos WHERE deleted_at IS NULL'}>
                        {(data) => {
                            return (
                                <ComponentConnect path="unidProdutiva.formAgua.residuoSolidos">
                                    <DropdownMultipleMaterial
                                        label="Destinação de resíduos sólidos"
                                        data={data.map((v) => {
                                            return { value: v.id, label: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <QueryDb query={'select * from esgotamento_sanitarios WHERE deleted_at IS NULL'}>
                        {(data) => {
                            return (
                                <ComponentConnect path="unidProdutiva.formAgua.esgotamentoSanitarios">
                                    <DropdownMultipleMaterial
                                        label="Esgotamento Sanitário"
                                        data={data.map((v) => {
                                            return { value: v.id, label: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

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

        form: Form(state`unidProdutiva.formAgua`),

        signalSalvar: signal`unidProdutiva.salvarAgua`,
    },
    AguaSubpage
);
