import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, Spacer } from '../../../components';
import { isValidForms } from '../../../utils/CerebralUtil';
import UnidadeProdutivaForm from './unidadeProdutivaForm/UnidadeProdutivaForm';

const styles = StyleSheet.create({
    scrollview: {
        flexGrow: 1,
    },
});

class UnidadeProdutivaSubpage extends React.Component {
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
            this.props.signalTouchForm({ form: 'produtor.formListUnidadeProdutiva.' + k });
        });

        Alert.alert('Aviso', 'Você precisa adicionar uma Unidade Produtiva para poder salvar.');
    };

    onAddPress = () => {
        this.props.signalAdd();
    };

    onDeletePress = ({ position }) => {
        this.props.signalDelete({ position });
    };

    isDisabled = () => {
        const { formList } = this.props;

        return !isValidForms(formList);
    };

    render() {
        const { formList } = this.props;

        return (
            <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                {formList.map((v, k) => {
                    if (!v) {
                        return null;
                    }

                    return (
                        <UnidadeProdutivaForm
                            key={k}
                            path={`produtor.formListUnidadeProdutiva.${k}`}
                            position={k}
                            expanded={!v.id.value}
                            onDeletePress={this.onDeletePress}
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
        formList: state`produtor.formListUnidadeProdutiva`,

        signalSalvar: signal`produtor.salvarUnidadeProdutiva`,

        signalAdd: signal`produtor.addUnidadeProdutiva`,
        signalDelete: signal`produtor.deleteUnidadeProdutiva`,

        signalTouchForm: signal`form.touchForm`,
    },
    UnidadeProdutivaSubpage
);
