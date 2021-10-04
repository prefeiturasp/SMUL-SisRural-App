import { form } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import PropTypes from 'prop-types';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Card, Checkbox, Dialog, Paragraph, Portal, Title } from 'react-native-paper';
import store from 'react-native-simple-store';
import {
    ActionRoute,
    Button,
    ComponentConnect,
    DropdownPaper,
    Form,
    Spacer,
    Text,
    TextInputPaper,
    Touchable,
    ViewSmart,
} from '../../components';
import styles from './LoginPage.styles';

class LoginPage extends React.Component {
    static propTypes = {
        signalLogin: PropTypes.func,
        signalFetchRoles: PropTypes.func,
        formLogin: PropTypes.any,
        requestLogin: PropTypes.any,
        requestFetchRoles: PropTypes.any,
    };

    constructor(props) {
        super(props);

        this.state = { checkTerms: false, showDialog: false };

        store.get('termsCheck').then(value => {
            this.setState({ checkTerms: value });
        });
    }

    onLoginPress = () => {
        if (!this.state.checkTerms) {
            this.setState({ showDialog: true });
            return;
        }
        this.props.signalLogin();
    };

    onForgotPress = () => {
        ActionRoute.go('/recuperarSenha');
    };

    onTermsPress = () => {
        this.props.signalTermsPress();
    };

    onTermsCheckPress = () => {
        this.setState({ checkTerms: !this.state.checkTerms });
        store.save('termsCheck', !this.state.checkTerms);
    };

    onLoginDisabledPress = () => {
        this.props.signalTouchForm({ form: 'login.formLogin' });
    };

    onDialogDismiss = () => {
        this.setState({ showDialog: false });
    };

    onCpfBlur = () => {
        this.props.signalFetchRoles();
    };

    getDominioData = () => {
        const { requestFetchRoles } = this.props;

        if (requestFetchRoles && requestFetchRoles.result && requestFetchRoles.result.roles) {
            return requestFetchRoles.result.roles.map(v => {
                return { label: v.nome, value: v.id };
            });
        }

        return [];
    };

    render() {
        const {
            formLogin,
            requestLogin: { loading },
        } = this.props;

        return (
            <View style={styles.root}>
                <Portal>
                    <Dialog visible={this.state.showDialog} onDismiss={this.onDialogDismiss}>
                        <Dialog.Title>Aviso</Dialog.Title>

                        <Dialog.Content>
                            <Paragraph>Você precisa aceitar os "Termos e Condições" para continuar.</Paragraph>
                        </Dialog.Content>

                        <Dialog.Actions>
                            <Button onPress={this.onDialogDismiss}>OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                <Spacer vertical={4}>
                    <Image source={require('./../init/assets/logo.png')} style={styles.logo} resizeMode="contain" />
                </Spacer>

                <Form path="login.formLogin">
                    <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                        <Spacer horizontal={4}>
                            <Card>
                                <Card.Content>
                                    <Spacer vertical={3} />

                                    <Title style={styles.textCenter}>Faça seu login</Title>

                                    <Spacer vertical={2} />

                                    <ComponentConnect path="login.formLogin.cpf">
                                        <TextInputPaper
                                            mode="outlined"
                                            label="CPF"
                                            mask="999.999.999-99"
                                            accessibilityLabel="Cadastro de pessoa física CPF"
                                            maxLength={14}
                                            onBlur={this.onCpfBlur}
                                        />
                                    </ComponentConnect>

                                    <ComponentConnect path="login.formLogin.password">
                                        <TextInputPaper mode="outlined" label="Senha" secureTextEntry={true} />
                                    </ComponentConnect>

                                    <ComponentConnect path="login.formLogin.id">
                                        <DropdownPaper
                                            mode="outlined"
                                            label="Domínio"
                                            data={this.getDominioData()}
                                            loading={this.props.requestFetchRoles.loading}
                                        />
                                    </ComponentConnect>

                                    <Spacer />

                                    <ViewSmart row alignCenter justifyCenter>
                                        <Touchable
                                            accessibilityRole="checkbox"
                                            accessibilityState={{ checked: this.state.checkTerms }}
                                            accessibilityLabel="Eu li e aceito os Termos e Condições"
                                            accessible={true}
                                            onPress={this.onTermsCheckPress}
                                        >
                                            <ViewSmart row alignCenter>
                                                <Checkbox status={this.state.checkTerms ? 'checked' : 'unchecked'} />
                                                <Text coolGrey>Eu li e aceito os </Text>
                                            </ViewSmart>
                                        </Touchable>

                                        <Touchable
                                            accessibilityHint="Abre os termos e condições"
                                            accessibilityLabel="Termos e Condições"
                                            onPress={this.onTermsPress}
                                        >
                                            <Text underline slateGrey>
                                                Termos e Condições
                                            </Text>
                                        </Touchable>
                                    </ViewSmart>

                                    <Spacer vertical={2} />

                                    <Button
                                        mode="contained"
                                        onPress={this.onLoginPress}
                                        disabled={!formLogin.isValid}
                                        onDisabledPress={this.onLoginDisabledPress}
                                        loading={loading}
                                    >
                                        ENTRAR
                                    </Button>

                                    <Spacer vertical={2} />

                                    <Touchable accessibilityLabel="Esqueci minha senha" onPress={this.onForgotPress}>
                                        <ViewSmart row justifyCenter>
                                            <Text coolGrey>Esqueceu a senha?</Text>
                                            <Spacer horizontal={0.5} />
                                            <Text coolGrey underline>
                                                Redefinir
                                            </Text>
                                        </ViewSmart>
                                    </Touchable>

                                    <Spacer vertical={2} />
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
        formLogin: form(state`login.formLogin`),

        requestLogin: state`login.requestLogin`,
        requestFetchRoles: state`login.requestFetchRoles`,

        signalLogin: signal`login.login`,
        signalFetchRoles: signal`login.fetchRoles`,
        signalTermsPress: signal`login.termsPress`,
        signalTouchForm: signal`form.touchForm`,
    },
    LoginPage
);
