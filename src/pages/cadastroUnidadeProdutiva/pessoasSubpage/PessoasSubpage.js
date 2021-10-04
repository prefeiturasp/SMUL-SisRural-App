import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, Spacer } from '../../../components';
import { isValidForms } from '../../../utils/CerebralUtil';
import PessoaForm from './pessoaForm/PessoaForm';

const styles = StyleSheet.create({
    scrollview: {
        flexGrow: 1,
    },
});

class PessoasSubpage extends React.Component {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onSalvarPress = () => {
        this.props.signalSalvarPessoas();
    };

    onDisabledPress = () => {
        const { formList } = this.props;

        formList.map((v, k) => {
            this.props.signalTouchForm({ form: 'unidProdutiva.formListPessoas.' + k });
        });

        Alert.alert('Aviso', 'Você precisa adicionar uma pessoa para poder salvar.');
    };

    onAddPress = () => {
        this.props.signalAddPessoa();
    };

    isDisabled = () => {
        const { formList } = this.props;

        return !isValidForms(formList);
    };

    onRemovePress = position => {
        this.props.signalRemovePessoa({ position });
    };

    render() {
        const { formList } = this.props;

        return (
            <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                {formList.map((v, k) => {
                    //Tira da listagem as pessoas removidas
                    if (v.deleted_at.value) {
                        return null;
                    }

                    return (
                        <PessoaForm
                            key={k}
                            path={`unidProdutiva.formListPessoas.${k}`}
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
        formList: state`unidProdutiva.formListPessoas`,

        signalSalvarPessoas: signal`unidProdutiva.salvarPessoas`,

        signalAddPessoa: signal`unidProdutiva.addPessoa`,

        signalRemovePessoa: signal`unidProdutiva.removePessoa`,

        signalTouchForm: signal`form.touchForm`,
    },
    PessoasSubpage
);
