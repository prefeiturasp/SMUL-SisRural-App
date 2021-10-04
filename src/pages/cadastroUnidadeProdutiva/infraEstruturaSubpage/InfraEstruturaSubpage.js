import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, Spacer } from '../../../components';
import { isValidForms } from '../../../utils/CerebralUtil';
import InfraEstruturaForm from './infraEstruturaForm/InfraEstruturaForm';

const styles = StyleSheet.create({
    scrollview: {
        flexGrow: 1,
    },
});

class InfraEstruturaSubpage extends React.Component {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onSalvarPress = () => {
        this.props.signalSalvarInfraEstrutura();
    };

    onDisabledPress = () => {
        const { formList } = this.props;

        formList.map((v, k) => {
            this.props.signalTouchForm({ form: 'unidProdutiva.formListInfraEstrutura.' + k });
        });

        Alert.alert('Aviso', 'Você precisa adicionar uma Infra-Estrutura para poder salvar.');
    };

    onAddPress = () => {
        this.props.signalAddInfraEstrutura();
    };

    isDisabled = () => {
        const { formList } = this.props;

        //Cliente pediu para passar reto qdo não tiver cadastro
        if (formList.length === 0) {
            return false;
        }

        return !isValidForms(formList);
    };

    onRemovePress = position => {
        this.props.signalRemoveInfraEstrutura({ position });
    };

    render() {
        const { formList } = this.props;

        return (
            <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                {formList.map((v, k) => {
                    if (v.deleted_at.value) {
                        return null;
                    }

                    return (
                        <InfraEstruturaForm
                            key={k}
                            path={`unidProdutiva.formListInfraEstrutura.${k}`}
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
                        SALVAR
                    </Button>

                    <Spacer vertical={2} />
                </Spacer>
            </ScrollView>
        );
    }
}

export default connect(
    {
        formList: state`unidProdutiva.formListInfraEstrutura`,

        signalSalvarInfraEstrutura: signal`unidProdutiva.salvarInfraEstrutura`,

        signalAddInfraEstrutura: signal`unidProdutiva.addInfraEstrutura`,

        signalRemoveInfraEstrutura: signal`unidProdutiva.removeInfraEstrutura`,

        signalTouchForm: signal`form.touchForm`,
    },
    InfraEstruturaSubpage
);
