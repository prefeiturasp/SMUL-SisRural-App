import { form } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { TextField } from '@softmedialab/react-native-material-textfield';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { Alert, PermissionsAndroid, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { ScrollView } from 'react-native-gesture-handler';
import {
    Button,
    CheckboxMaterial,
    ComponentConnect,
    DropdownMaterial,
    DropdownSearchable,
    HeaderMenu,
    QueryDb,
    Spacer,
    TextInputMaterial,
    ViewSmart,
} from '../../components';
import DetachedTabBar from '../../components/tabViewMaterial/DetachedTabBar';
import { openUrl } from '../../utils/AppUtil';

class CadastroRapidoProdutorPage extends React.Component {
    static propTypes = {};

    onSalvarPress = () => {
        this.props.signalSave();
    };

    onDisabledPress = () => {
        this.props.touchForm({ form: 'cadastroRapidoProdutor.formCadastroBasico' });
        this.props.touchForm({ form: 'cadastroRapidoProdutor.formRelacao' });
        this.props.touchForm({ form: 'cadastroRapidoProdutor.formUnidadeProdutiva' });
    };

    onCapturarCoordPress = async () => {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
                title: 'Localização',
                message: 'O app precisa acessar sua localização',
            });

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                Geolocation.getCurrentPosition(
                    (position) => {
                        const { coords } = position;
                        this.props.setField({
                            path: 'cadastroRapidoProdutor.formUnidadeProdutiva.lat',
                            value: coords.latitude.toString(),
                        });

                        this.props.setField({
                            path: 'cadastroRapidoProdutor.formUnidadeProdutiva.lng',
                            value: coords.longitude.toString(),
                        });
                    },
                    (error) => {
                        //Fallback com "enableHighAccuracy" = false
                        Geolocation.getCurrentPosition(
                            (position) => {
                                const { coords } = position;
                                this.props.setField({
                                    path: 'cadastroRapidoProdutor.formUnidadeProdutiva.lat',
                                    value: coords.latitude.toString(),
                                });

                                this.props.setField({
                                    path: 'cadastroRapidoProdutor.formUnidadeProdutiva.lng',
                                    value: coords.longitude.toString(),
                                });
                            },
                            (error) => {
                                Alert.alert('Aviso', error.message);
                            },
                            {
                                showLocationDialog: true,
                                forceRequestLocation: true,
                                enableHighAccuracy: false,
                            }
                        );
                    },
                    {
                        showLocationDialog: false,
                        enableHighAccuracy: true,
                        timeout: 5000,
                    }
                );
            } else {
                Alert.alert('Aviso', 'Permissão negada');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    onDropdownFocus = () => {
        setTimeout(() => {
            this._scrollview.scrollTo({ x: 0, y: this._scrollY + 150, animated: true });
        }, 500);
    };
    handleScroll = (event) => {
        this._scrollY = event.nativeEvent.contentOffset.y;
    };

    onVerMapaPress = () => {
        const { lat, lng } = this.props.formUnidadeProdutiva;
        openUrl(`https://maps.google.com/?q=${lat.value},${lng.value}`);
    };

    componentWillUnmount() {
        this.props.signalReset();
    }
    render() {
        const { formCadastroBasico, formUnidadeProdutiva, formRelacao } = this.props;

        const isRelacao = formRelacao.isRelacao.value;
        const isDisabled = !(
            formCadastroBasico.isValid && (isRelacao ? formRelacao.isValid : formUnidadeProdutiva.isValid)
        );

        return (
            <React.Fragment>
                <HeaderMenu title="Novo Produtor/a" />

                <ScrollView
                    ref={(e) => (this._scrollview = e)}
                    onScroll={this.handleScroll}
                    keyboardShouldPersistTaps={'handled'}
                >
                    <Spacer horizontal={4}>
                        <DetachedTabBar>PRODUTOR</DetachedTabBar>

                        <ComponentConnect path="cadastroRapidoProdutor.formCadastroBasico.nome">
                            <TextInputMaterial label="Nome Completo" />
                        </ComponentConnect>

                        <ComponentConnect path="cadastroRapidoProdutor.formCadastroBasico.cpf">
                            <TextInputMaterial
                                label="CPF"
                                mask="999.999.999-99"
                                keyboardType="numeric"
                                maxLength={14}
                            />
                        </ComponentConnect>

                        <ComponentConnect path="cadastroRapidoProdutor.formCadastroBasico.telefone_1">
                            <TextInputMaterial
                                label="Telefone 1"
                                mask="99 999999999"
                                maxLength={13}
                                keyboardType="phone-pad"
                            />
                        </ComponentConnect>

                        <ComponentConnect path="cadastroRapidoProdutor.formCadastroBasico.telefone_2">
                            <TextInputMaterial
                                label="Telefone 2"
                                mask="99 999999999"
                                maxLength={13}
                                keyboardType="phone-pad"
                            />
                        </ComponentConnect>

                        <Spacer vertical={2} />

                        <DetachedTabBar>UNIDADE PRODUTIVA</DetachedTabBar>

                        <ComponentConnect path="cadastroRapidoProdutor.formRelacao.isRelacao">
                            <CheckboxMaterial label="Relacionar com uma Unidade Produtiva já existente" />
                        </ComponentConnect>

                        <QueryDb query={'select * from tipo_posses WHERE deleted_at IS NULL'}>
                            {(data) => {
                                return (
                                    <ComponentConnect path={`cadastroRapidoProdutor.formRelacao.tipo_posse_id`}>
                                        <DropdownMaterial
                                            label="Tipo de Relação"
                                            data={data.map((v) => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

                        {isRelacao && (
                            <View>
                                <QueryDb
                                    query={
                                        'select id,nome from unidade_produtivas where deleted_at is null order by nome COLLATE NOCASE ASC'
                                    }
                                >
                                    {(data) => {
                                        return (
                                            <ComponentConnect
                                                path={'cadastroRapidoProdutor.formRelacao.unidade_produtiva_id'}
                                            >
                                                <DropdownSearchable
                                                    label="Unidade Produtiva"
                                                    data={data}
                                                    onFocus={this.onDropdownFocus}
                                                />
                                            </ComponentConnect>
                                        );
                                    }}
                                </QueryDb>
                            </View>
                        )}

                        {!isRelacao && (
                            <View>
                                <ComponentConnect path="cadastroRapidoProdutor.formUnidadeProdutiva.nome">
                                    <TextInputMaterial label="Nome da Unidade Produtiva" />
                                </ComponentConnect>

                                <ComponentConnect path="cadastroRapidoProdutor.formUnidadeProdutiva.cep">
                                    <TextInputMaterial
                                        label="CEP"
                                        mask="99999-999"
                                        keyboardType="numeric"
                                        maxLength={9}
                                    />
                                </ComponentConnect>

                                <ComponentConnect path="cadastroRapidoProdutor.formUnidadeProdutiva.endereco">
                                    <TextInputMaterial label="Endereço" />
                                </ComponentConnect>

                                <ComponentConnect path="cadastroRapidoProdutor.formUnidadeProdutiva.bairro">
                                    <TextInputMaterial label="Bairro" />
                                </ComponentConnect>

                                <QueryDb query={'select * from estados  order by nome COLLATE NOCASE ASC'}>
                                    {(data) => {
                                        return (
                                            <ComponentConnect path="cadastroRapidoProdutor.formUnidadeProdutiva.estado_id">
                                                <DropdownMaterial
                                                    label="Estado"
                                                    data={data.map((v) => {
                                                        return { value: v.id, label: v.nome };
                                                    })}
                                                />
                                            </ComponentConnect>
                                        );
                                    }}
                                </QueryDb>

                                <QueryDb
                                    query={'select * from cidades where estado_id=:id order by nome COLLATE NOCASE ASC'}
                                    params={[formUnidadeProdutiva.estado_id.value]}
                                >
                                    {(data) => {
                                        return (
                                            <ComponentConnect
                                                path={'cadastroRapidoProdutor.formUnidadeProdutiva.cidade_id'}
                                            >
                                                <DropdownSearchable
                                                    label="Cidade"
                                                    data={data}
                                                    onFocus={this.onDropdownFocus}
                                                />
                                            </ComponentConnect>
                                        );
                                    }}
                                </QueryDb>

                                <Spacer vertical={2} />
                                <DetachedTabBar>COORDENADAS</DetachedTabBar>
                                <ComponentConnect path="cadastroRapidoProdutor.formUnidadeProdutiva.lat">
                                    <TextField label="Latitude" />
                                </ComponentConnect>

                                <ComponentConnect path="cadastroRapidoProdutor.formUnidadeProdutiva.lng">
                                    <TextField label="Longitude" />
                                </ComponentConnect>

                                <Spacer vertical={2} />
                                <ViewSmart row>
                                    <Button mode="outlined" compact onPress={this.onCapturarCoordPress}>
                                        CAPTURAR COORDENADA
                                    </Button>

                                    <Spacer />

                                    <Button
                                        mode="outlined"
                                        compact
                                        disabled={!formUnidadeProdutiva.lat.value || !formUnidadeProdutiva.lng.value}
                                        onPress={this.onVerMapaPress}
                                    >
                                        VER NO MAPA
                                    </Button>
                                </ViewSmart>
                            </View>
                        )}
                        <Spacer vertical={4} />
                        <Button
                            mode="contained"
                            disabled={isDisabled}
                            onPress={this.onSalvarPress}
                            onDisabledPress={this.onDisabledPress}
                        >
                            SALVAR E CONTINUAR
                        </Button>

                        <Spacer vertical={2} />
                    </Spacer>
                </ScrollView>
            </React.Fragment>
        );
    }
}

export default connect(
    {
        signalReset: signal`cadastroRapidoProdutor.reset`,
        signalSave: signal`cadastroRapidoProdutor.save`,
        setField: signal`form.setField`,
        touchForm: signal`form.touchForm`,
        formCadastroBasico: form(state`cadastroRapidoProdutor.formCadastroBasico`),
        formUnidadeProdutiva: form(state`cadastroRapidoProdutor.formUnidadeProdutiva`),
        formRelacao: form(state`cadastroRapidoProdutor.formRelacao`),
    },
    CadastroRapidoProdutorPage
);
