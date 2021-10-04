import { form } from '@cerebral/forms';
import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
    ActionRoute,
    Button,
    ComponentConnect,
    HeaderMenu,
    Spacer,
    Text,
    TextInputMaterial,
    Touchable,
    ViewSmart,
} from '../../../components';
import DetachedTabBar from '../../../components/tabViewMaterial/DetachedTabBar';
import { openUrl } from '../../../utils/AppUtil';
import styles from './NovaFotoPage.styles';

class NovaFotoPage extends React.Component {
    isSaveEnabled = () => {
        const { permiteAlterar } = this.props.permissoes;
        if (!permiteAlterar || (this.props.caderno && this.props.caderno.status === 'finalizado')) {
            return false;
        }

        return true;
    };

    onLatLngPress = () => {
        const lat = this.props.photoForm.lat.value;
        const lng = this.props.photoForm.lng.value;

        openUrl(`geo:${lat},${lng}`);
    };

    onSaveNew = () => {
        const { permiteAlterar } = this.props.permissoes;
        if (!permiteAlterar) {
            return;
        }

        this.props.signalSavePhoto();
    };

    onSave = () => {
        const { permiteAlterar } = this.props.permissoes;
        if (!permiteAlterar) {
            return;
        }

        this.props.signalSavePhoto();
    };

    onDeletePress = () => {
        const { photoForm } = this.props;
        this.props.signalRemovePhoto({ id: photoForm.id.value });
    };

    onCancel = () => {
        ActionRoute.back();
    };

    render() {
        const { photoForm } = this.props;
        const { permiteAlterar } = this.props.permissoes;

        return (
            <React.Fragment>
                <HeaderMenu title={'Foto / Caderno de Campo'} />

                <ScrollView keyboardShouldPersistTaps={'handled'}>
                    <Spacer horizontal={4}>
                        <DetachedTabBar>FOTO</DetachedTabBar>
                        <Spacer horizontal={0} vertical={4}>
                            <Image
                                resizeMode="contain"
                                style={styles.image}
                                source={{ uri: photoForm.arquivo.value || photoForm.app_arquivo_caminho.value }}
                            />
                        </Spacer>

                        {photoForm.lat.value && (
                            <ViewSmart row alignCenter>
                                <ViewSmart flex1>
                                    <TextInputMaterial
                                        disabled
                                        label="Latitude/Longitude"
                                        value={photoForm.lat.value + ',' + photoForm.lng.value}
                                    />
                                </ViewSmart>

                                {permiteAlterar && (
                                    <ViewSmart>
                                        <Touchable onPress={this.onLatLngPress}>
                                            <Spacer left={7} top={5}>
                                                <Text teal>Localizar</Text>
                                            </Spacer>
                                        </Touchable>
                                    </ViewSmart>
                                )}
                            </ViewSmart>
                        )}

                        <ComponentConnect path="cadernoCampo.photoForm.descricao">
                            <TextInputMaterial
                                disabled={!this.isSaveEnabled()}
                                multiline={true}
                                label="Descrição da imagem"
                            />
                        </ComponentConnect>

                        <Spacer vertical={2} />

                        {this.isSaveEnabled() && (
                            <Button onPress={this.onSave}>{!photoForm.id.value ? 'ADICIONAR' : 'SALVAR'}</Button>
                        )}

                        {this.isSaveEnabled() && !!photoForm.id.value && (
                            <React.Fragment>
                                <Spacer vertical={2} />

                                <Touchable onPress={this.onDeletePress}>
                                    <Spacer horizontal={0} vertical={2}>
                                        <Text red size16 fontMedium alignCenter>
                                            EXCLUIR
                                        </Text>
                                    </Spacer>
                                </Touchable>
                            </React.Fragment>
                        )}

                        <Spacer vertical={2} />

                        <Button onPress={this.onCancel} mode="text">
                            {this.isSaveEnabled() ? 'CANCELAR' : 'VOLTAR'}
                        </Button>
                    </Spacer>
                </ScrollView>
            </React.Fragment>
        );
    }
}

export default connect(
    {
        caderno: state`cadernoCampo.cadernoData`,
        permissoes: state`cadernoCampo.permissoes`,

        photoForm: form(state`cadernoCampo.photoForm`),
        signalSavePhoto: signal`cadernoCampo.savePhoto`,
        signalRemovePhoto: signal`cadernoCampo.removePhoto`,
    },
    NovaFotoPage
);
