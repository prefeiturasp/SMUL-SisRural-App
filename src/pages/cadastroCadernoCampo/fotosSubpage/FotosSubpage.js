import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import PropTypes from 'prop-types';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { QueryDb, Spacer, Text, Touchable, ViewSmart } from '../../../components';
import DetachedTabBar from '../../../components/tabViewMaterial/DetachedTabBar';
import Theme from '../../../Theme';
import styles from './FotosSubpage.styles';

const QUERY =
    'select id,app_arquivo_caminho,arquivo from caderno_arquivos where caderno_id=:id and deleted_at is null and tipo="imagem"';

class FotosSubpage extends React.Component {
    static propTypes = {
        permiteAlterar: PropTypes.bool,
    };

    onPhotoPress = (data) => {
        //Não sei porque colocaram essa ação aqui, o erro que acontecia é que ele reabria o caderno de campo (Status rascunho) e alterava as datas
        //this.props.onSaveSilent();

        this.props.signalImageThumbPress({ imageId: data.id });
    };

    renderPhoto(data, i) {
        return (
            <View key={i} style={[styles.item]}>
                <Touchable onPress={this.onPhotoPress.bind(this, data)}>
                    <MaterialCommunityIcons style={styles.fallback} color={Theme.colors.teal} size={40} name="alert" />

                    <Image style={styles.itemImage} source={{ uri: data.arquivo || data.app_arquivo_caminho }} />
                </Touchable>
            </View>
        );
    }

    renderAddButton() {
        return (
            <Touchable onPress={this.onAddPress}>
                <View style={[styles.item, styles.addButton]}>
                    <MaterialCommunityIcons color={Theme.colors.teal} size={40} name="plus-circle-outline" />
                </View>
            </Touchable>
        );
    }

    onAddPress = () => {
        if (!this.props.permiteAlterar) {
            return;
        }

        this.props.onSaveSilent();

        this.props.signalAddPhoto();
    };

    isFinalizado() {
        return this.props.caderno && this.props.caderno.status === 'finalizado';
    }

    renderPhotos = (data) => {
        return data.map((foto, i) => {
            return this.renderPhoto(foto, i);
        });
    };

    render() {
        if (!this.props.caderno) {
            return <Spacer />;
        }

        const { permiteAlterar } = this.props;

        return (
            <QueryDb query={QUERY} params={[this.props.caderno.id]}>
                {(data) => {
                    if (data.length === 0 && this.isFinalizado()) {
                        return null;
                    }

                    return (
                        <ScrollView keyboardShouldPersistTaps={'handled'}>
                            <Spacer horizontal={4}>
                                <DetachedTabBar>FOTOS</DetachedTabBar>
                            </Spacer>

                            {data && data.length == 0 && (
                                <ViewSmart alignCenter>
                                    <Spacer />
                                    <Text size14 coolGrey>
                                        Não há nenhuma foto.
                                    </Text>
                                </ViewSmart>
                            )}

                            <Spacer horizontal={4}>
                                <View style={styles.list}>
                                    {this.renderPhotos(data)}

                                    {!this.isFinalizado() && permiteAlterar && this.renderAddButton()}
                                </View>
                            </Spacer>
                        </ScrollView>
                    );
                }}
            </QueryDb>
        );
    }
}

export default connect(
    {
        caderno: state`cadernoCampo.cadernoData`,
        signalAddPhoto: signal`cadernoCampo.addPhoto`,
        signalImageThumbPress: signal`cadernoCampo.imageThumbPress`,
    },
    FotosSubpage
);
