import { form } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Card, Title } from 'react-native-paper';
import {
    ActionRoute,
    Button,
    ComponentConnect,
    Form,
    Spacer,
    Text,
    TextInputPaper,
    Touchable,
    ViewSmart,
} from '../../components';
import styles from './RecuperarSenhaPage.styles';

class RecuperarSenhaPage extends React.Component {
    onForgotPress = () => {
        this.props.signalRecuperar();
    };

    onLoginPress = () => {
        ActionRoute.replace('/login');
    };

    onLoginDisabledPress = () => {
        this.props.signalTouchForm({ form: 'recuperarSenha.form' });
    };

    render() {
        const {
            form,
            requestRecuperar: { loading },
        } = this.props;

        return (
            <View style={styles.root}>
                <Spacer vertical={4}>
                    <Text fontBold white size38 alignCenter>
                        SisRural
                    </Text>
                </Spacer>

                <Form path="recuperarSenha.form">
                    <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                        <Spacer horizontal={4}>
                            <Card>
                                <Card.Content>
                                    <Spacer vertical={8} />

                                    <Title style={styles.textCenter}>Redefina a sua senha</Title>

                                    <Spacer vertical={3} />

                                    <ComponentConnect path="recuperarSenha.form.cpf">
                                        <TextInputPaper
                                            mode="outlined"
                                            label="CPF"
                                            mask="999.999.999-99"
                                            maxLength={14}
                                        />
                                    </ComponentConnect>

                                    <Button
                                        mode="contained"
                                        onPress={this.onForgotPress}
                                        onDisabledPress={this.onLoginDisabledPress}
                                        disabled={!form.isValid}
                                        loading={loading}
                                    >
                                        RECEBER LINK DE REDEFINIÇÃO
                                    </Button>

                                    <Spacer vertical={2} />

                                    <Touchable accessibilityLabel="Logar com outro usuário" onPress={this.onLoginPress}>
                                        <ViewSmart row justifyCenter>
                                            <Text coolGrey>Logar com</Text>

                                            <Spacer horizontal={0.5} />

                                            <Text coolGrey underline>
                                                outro usuário
                                            </Text>
                                        </ViewSmart>
                                    </Touchable>

                                    <Spacer vertical={8} />
                                </Card.Content>
                            </Card>
                        </Spacer>
                    </ScrollView>
                </Form>
            </View>
        );
    }
}

export default connect(
    {
        form: form(state`recuperarSenha.form`),
        signalRecuperar: signal`recuperarSenha.recuperar`,
        requestRecuperar: state`recuperarSenha.requestRecuperar`,
        signalTouchForm: signal`form.touchForm`,
    },
    RecuperarSenhaPage
);
