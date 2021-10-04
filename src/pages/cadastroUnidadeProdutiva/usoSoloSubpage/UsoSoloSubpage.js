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
import { isValidForms } from '../../../utils/CerebralUtil';
import UsoSoloForm from './usoSoloForm/UsoSoloForm';

const styles = StyleSheet.create({
    scrollview: {
        flexGrow: 1,
    },
});

class UsoSoloSubpage extends React.Component {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onSalvarPress = () => {
        this.props.signalSalvar();
    };

    onDisabledPress = () => {
        const { formList } = this.props;

        formList.map((v, k) => {
            this.props.signalTouchForm({ form: 'unidProdutiva.formListUsoSolo.' + k });
        });

        this.props.signalTouchForm({ form: 'unidProdutiva.formUsoSolo' });
    };

    onAddPress = () => {
        this.props.signalAddUsoSolo();
    };

    isDisabled = () => {
        const { formList, form } = this.props;

        return !form.isValid || (formList.length > 0 && !isValidForms(formList));
    };

    onRemovePress = position => {
        this.props.signalRemoveUsoSolo({ position });
    };

    render() {
        const { formList } = this.props;

        return (
            <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                <Spacer horizontal={4} vertical={0}>
                    <ComponentConnect path="unidProdutiva.formUsoSolo.area_total_solo">
                        <TextInputMaterial label="Área total da propriedade" />
                    </ComponentConnect>
                </Spacer>

                <Spacer vertical={2} />

                {formList.map((v, k) => {
                    if (v.deleted_at.value) {
                        return null;
                    }

                    return (
                        <UsoSoloForm
                            key={k}
                            path={`unidProdutiva.formListUsoSolo.${k}`}
                            position={k}
                            expanded={!v.id.value}
                            onRemovePress={this.onRemovePress}
                        />
                    );
                })}

                <Spacer horizontal={4}>
                    <Button icon="plus-circle-outline" mode="text" onPress={this.onAddPress}>
                        CLIQUE PARA ADICIONAR
                    </Button>

                    <Spacer vertical={2} />

                    <QueryDb query={"select * from solo_categorias where tipo = 'outros' AND deleted_at IS NULL"}>
                        {data => {
                            return (
                                <ComponentConnect path="unidProdutiva.formUsoSolo.solosCategoria">
                                    <DropdownMultipleMaterial
                                        label="Outros Usos"
                                        data={data.map(v => {
                                            return { value: v.id, label: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <ComponentConnect path="unidProdutiva.formUsoSolo.outros_usos_descricao">
                        <TextInputMaterial label="Outros Usos - Descrição" />
                    </ComponentConnect>

                    <ComponentConnect path="unidProdutiva.formUsoSolo.fl_producao_processa">
                        <DropdownMaterial
                            label="Processa a produção?"
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
                                    label: 'Não tem interesse',
                                    value: 'nao_tem_interesse',
                                },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="unidProdutiva.formUsoSolo.fl_producao_processa">
                        <ComponentConnect path="unidProdutiva.formUsoSolo.producao_processa_descricao">
                            <TextInputMaterial label="Descreva o processamento da produção" />
                        </ComponentConnect>
                    </ShowElement>

                    <Spacer vertical={2} />

                    <Button
                        mode="contained"
                        disabled={this.isDisabled()}
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
        formList: state`unidProdutiva.formListUsoSolo`,

        form: Form(state`unidProdutiva.formUsoSolo`),

        signalSalvar: signal`unidProdutiva.salvarUsoSolo`,

        signalAddUsoSolo: signal`unidProdutiva.addUsoSolo`,

        signalRemoveUsoSolo: signal`unidProdutiva.removeUsoSolo`,

        signalTouchForm: signal`form.touchForm`,
    },
    UsoSoloSubpage
);
