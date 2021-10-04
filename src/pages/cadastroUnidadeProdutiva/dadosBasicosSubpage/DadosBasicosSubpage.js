import { form as Form } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { Alert, PermissionsAndroid, ScrollView, StyleSheet, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {
    Button,
    ComponentConnect,
    DropdownMaterial,
    DropdownSearchable,
    QueryDb,
    Separator,
    Spacer,
    Text,
    TextInputMaterial,
    ViewSmart,
} from '../../../components';
import { openUrl } from '../../../utils/AppUtil';

const styles = StyleSheet.create({
    scrollview: {
        flexGrow: 1,
    },
});

class DadosBasicosSubpage extends React.PureComponent {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onSalvarPress = () => {
        this.props.signalSalvar({ produtorId: this.props.produtorId });
    };

    onDisabledPress = () => {
        this.props.touchForm({ form: 'unidProdutiva.formDadosBasicos' });
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
                            path: 'unidProdutiva.formDadosBasicos.lat',
                            value: coords.latitude.toString(),
                        });

                        this.props.setField({
                            path: 'unidProdutiva.formDadosBasicos.lng',
                            value: coords.longitude.toString(),
                        });
                    },
                    (error) => {
                        Alert.alert('Aviso', error.message);
                    },
                    {
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

    onVerMapaPress = () => {
        const { lat, lng } = this.props.form;
        openUrl(`https://maps.google.com/?q=${lat.value},${lng.value}`);
        // openUrl(`geo:${lat.value},${lng.value}`); //Não funciona dispositivos antigos/não tem GEO
    };

    handleScroll = (event) => {
        this._scrollY = event.nativeEvent.contentOffset.y;
    };

    onDropdownFocus = () => {
        setTimeout(() => {
            this._scrollview.scrollTo({ x: 0, y: this._scrollY + 150, animated: true });
        }, 500);
    };

    render() {
        const { form } = this.props;

        return (
            <ScrollView
                scrollEventThrottle={1}
                ref={(e) => (this._scrollview = e)}
                contentContainerStyle={styles.scrollview}
                keyboardShouldPersistTaps={'handled'}
                onScroll={this.handleScroll}
            >
                {!!form.id.value && (
                    <View>
                        <Spacer horizontal={4}>
                            <Spacer />

                            <Text fontBold teal size20>
                                Produtor/a
                            </Text>

                            <Spacer />

                            <QueryDb
                                query={
                                    'select produtores.* from produtores, produtor_unidade_produtiva where produtores.id = produtor_unidade_produtiva.produtor_id AND unidade_produtiva_id=:unidade_produtiva_id'
                                }
                                params={[form.id.value]}
                            >
                                {(data) => {
                                    return (
                                        <View>
                                            {data.map((v) => {
                                                return (
                                                    <View key={v.id}>
                                                        <Text size16>{v.nome}</Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    );
                                }}
                            </QueryDb>
                        </Spacer>

                        <Spacer />

                        <Separator />
                    </View>
                )}

                <Spacer horizontal={4}>
                    <ComponentConnect path="unidProdutiva.formDadosBasicos.nome">
                        <TextInputMaterial label="Nome da Unidade Produtiva" />
                    </ComponentConnect>

                    <ComponentConnect path="unidProdutiva.formDadosBasicos.lat">
                        <TextInputMaterial label="Latitude" />
                    </ComponentConnect>

                    <ComponentConnect path="unidProdutiva.formDadosBasicos.lng">
                        <TextInputMaterial label="Longitude" />
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
                            disabled={!form.lat.value || !form.lng.value}
                            onPress={this.onVerMapaPress}
                        >
                            VER NO MAPA
                        </Button>
                    </ViewSmart>

                    <Spacer vertical={2} />

                    <ComponentConnect path="unidProdutiva.formDadosBasicos.cep">
                        <TextInputMaterial label="CEP" mask="99999-999" keyboardType="numeric" maxLength={9} />
                    </ComponentConnect>

                    <ComponentConnect path="unidProdutiva.formDadosBasicos.endereco">
                        <TextInputMaterial label="Endereço" />
                    </ComponentConnect>

                    <ComponentConnect path="unidProdutiva.formDadosBasicos.bairro">
                        <TextInputMaterial label="Bairro" />
                    </ComponentConnect>

                    <QueryDb query={'select * from estados  order by nome COLLATE NOCASE ASC'}>
                        {(data) => {
                            return (
                                <ComponentConnect path="unidProdutiva.formDadosBasicos.estado_id">
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
                        params={[this.props.form.estado_id.value]}
                    >
                        {(data) => {
                            return (
                                <ComponentConnect path={'unidProdutiva.formDadosBasicos.cidade_id'}>
                                    <DropdownSearchable label="Cidade" data={data} onFocus={this.onDropdownFocus} />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <ComponentConnect path="unidProdutiva.formDadosBasicos.bacia_hidrografica">
                        <TextInputMaterial label="Bacia Hidrográfica" />
                    </ComponentConnect>

                    <ComponentConnect path={`unidProdutiva.formDadosBasicos.status`}>
                        <DropdownMaterial
                            label="Status"
                            data={[
                                { value: 'ativo', label: 'Ativo' },
                                { value: 'inativo', label: 'Inativo' },
                            ]}
                        />
                    </ComponentConnect>

                    <ComponentConnect path="unidProdutiva.formDadosBasicos.status_observacao">
                        <TextInputMaterial label="Status - Observação" />
                    </ComponentConnect>

                    <Spacer vertical={4} />

                    <Button
                        mode="contained"
                        disabled={!form.isValid}
                        onPress={this.onSalvarPress}
                        onDisabledPress={this.onDisabledPress}
                    >
                        SALVAR E CONTINUAR
                    </Button>

                    <Spacer vertical={4} />
                </Spacer>
            </ScrollView>
        );
    }
}

export default connect(
    {
        touchForm: signal`form.touchForm`,
        form: Form(state`unidProdutiva.formDadosBasicos`),
        signalSalvar: signal`unidProdutiva.salvarDadosBasicos`,
        setField: signal`form.setField`,
    },
    DadosBasicosSubpage
);
