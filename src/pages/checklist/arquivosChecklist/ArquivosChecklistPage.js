import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Dialog, Portal } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { compose } from 'recompose';
import { getRepository } from 'typeorm/browser';
import {
    ActionRoute,
    Button,
    DetachedTabBar,
    HeaderMenu,
    Spacer,
    Text,
    TextInputMaterial,
    Touchable,
    ViewSmart,
} from '../../../components';
import ChecklistUnidadeProdutiva from '../../../db/typeORM/ChecklistUnidadeProdutivaModel';
import withData from '../../../db/typeORM/withModel';
import Theme from '../../../Theme';
import styles from './ArquivosChecklistPage.styles';
import FileItem from './fileItem/FileItem';
import PhotoItem from './photoItem/PhotoItem';

class ArquivosChecklistPage extends React.Component {
    static propTypes = {};

    constructor(props) {
        super(props);

        this.state = { description: '' };
    }

    componentDidMount() {
        const { checklistUnidadeProdutiva } = this.props.match.params;

        this.props.signalLoadFilesAndPhotos({ checklist_unidade_produtiva_id: checklistUnidadeProdutiva });
    }

    componentWillUnmount() {
        this.props.signalResetFilesAndPhotos();
    }

    onAddFilePress = async () => {
        const { checklistUnidadeProdutiva } = this.props.match.params;
        this.props.signalAddFile({ checklist_unidade_produtiva_id: checklistUnidadeProdutiva });
    };

    onAddPhotoPress = async () => {
        const { checklistUnidadeProdutiva } = this.props.match.params;
        this.props.signalAddPhoto({ checklist_unidade_produtiva_id: checklistUnidadeProdutiva });
    };

    onDeletePress = ({ id }) => {
        const { checklistUnidadeProdutiva } = this.props.match.params;
        this.props.signalRemoveFile({ id, checklist_unidade_produtiva_id: checklistUnidadeProdutiva });
    };

    onBack = () => {
        const { checklistUnidadeProdutiva } = this.props.match.params;
        ActionRoute.replace(`/editarChecklist/${checklistUnidadeProdutiva}`);
    };

    onEditDescriptionPress = (v) => {
        this.props.signalEditDescription({ id: v.id });
    };

    renderFiles = (canUpdate) => {
        const { filesForm } = this.props;

        return (
            <React.Fragment>
                <Spacer horizontal={4}>
                    <DetachedTabBar>ANEXOS</DetachedTabBar>
                </Spacer>

                {!!filesForm && (
                    <Spacer horizontal={4} top={4} bottom={0}>
                        {filesForm.map((v, k) => {
                            return (
                                <FileItem
                                    key={k}
                                    data={v}
                                    onDeletePress={canUpdate ? this.onDeletePress.bind(this, v) : null}
                                    onEditPress={canUpdate ? this.onEditDescriptionPress.bind(this, v) : null}
                                />
                            );
                        })}
                    </Spacer>
                )}

                {(!filesForm || filesForm.length == 0) && <View></View>}

                {canUpdate && (
                    <Touchable onPress={this.onAddFilePress}>
                        <Spacer horizontal={2} vertical={2}>
                            <ViewSmart row alignCenter justifyCenter>
                                <MaterialCommunityIcons
                                    color={Theme.colors.teal}
                                    size={20}
                                    name="plus-circle-outline"
                                />

                                <Spacer>
                                    <Text size12 teal>
                                        CLIQUE AQUI PARA ADICIONAR UM ARQUIVO
                                    </Text>
                                </Spacer>
                            </ViewSmart>
                        </Spacer>
                    </Touchable>
                )}
            </React.Fragment>
        );
    };

    renderPhotos = (canUpdate) => {
        const { photosForm } = this.props;

        return (
            <React.Fragment>
                <Spacer horizontal={4}>
                    <DetachedTabBar>FOTOS</DetachedTabBar>
                </Spacer>

                {!!photosForm && (
                    <Spacer horizontal={4} top={4} bottom={0}>
                        {photosForm.map((v, k) => {
                            return (
                                <PhotoItem
                                    key={k}
                                    data={v}
                                    onDeletePress={canUpdate ? this.onDeletePress.bind(this, v) : null}
                                    onEditPress={canUpdate ? this.onEditDescriptionPress.bind(this, v) : null}
                                />
                            );
                        })}
                    </Spacer>
                )}

                {(!photosForm || photosForm.length == 0) && <View></View>}

                {canUpdate && (
                    <Touchable onPress={this.onAddPhotoPress}>
                        <Spacer horizontal={2} vertical={2}>
                            <ViewSmart row alignCenter justifyCenter>
                                <MaterialCommunityIcons
                                    color={Theme.colors.teal}
                                    size={20}
                                    name="plus-circle-outline"
                                />

                                <Spacer>
                                    <Text size12 teal>
                                        CLIQUE AQUI PARA ADICIONAR UMA FOTO
                                    </Text>
                                </Spacer>
                            </ViewSmart>
                        </Spacer>
                    </Touchable>
                )}
            </React.Fragment>
        );
    };

    onChangeDescriptionText = (text) => {
        this.setState({ description: text });
    };

    onSaveDescription = () => {
        const { checklistUnidadeProdutiva } = this.props.match.params;
        const { description } = this.state;

        this.props.signalSaveDescription({
            description,
            id: this.props.fileIdDescription,
            checklist_unidade_produtiva_id: checklistUnidadeProdutiva,
        });

        this.setState({ description: '' });
    };

    render() {
        const { checklistUnidadeProdutiva } = this.props;
        const canUpdate = checklistUnidadeProdutiva.status === 'rascunho' && checklistUnidadeProdutiva.can_update;

        return (
            <View style={styles.root}>
                <Portal>
                    <Dialog visible={!!this.props.fileIdDescription} onDismiss={this.onSaveDescription}>
                        <Dialog.Content>
                            <TextInputMaterial
                                label="Descrição"
                                value={this.state.description}
                                onChangeText={this.onChangeDescriptionText}
                            ></TextInputMaterial>
                        </Dialog.Content>

                        <Dialog.Actions>
                            <Button onPress={this.onSaveDescription}>OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                <View style={styles.header}>
                    <HeaderMenu title={'Formulário'} />
                </View>

                <ScrollView keyboardShouldPersistTaps={'handled'}>
                    {this.renderPhotos(canUpdate)}
                    {this.renderFiles(canUpdate)}
                </ScrollView>

                <View style={styles.footer}>
                    <Spacer vertical={4} horizontal={4}>
                        <Button mode="contained" onPress={this.onBack}>
                            VOLTAR
                        </Button>
                    </Spacer>
                </View>
            </View>
        );
    }
}

const composed = compose(
    withData(async (props) => {
        const id = props.match.params.checklistUnidadeProdutiva;

        const repo = getRepository(ChecklistUnidadeProdutiva);

        const data = await repo
            .createQueryBuilder('CUP')
            .where(
                `CUP.id = :id and 
                 CUP.deleted_at is null`,
                { id: id }
            )
            .getOne();

        if (!data) {
            ActionRoute.replace('/home');
        }

        return data;
    }, 'checklistUnidadeProdutiva')
)((props) => {
    return <ArquivosChecklistPage {...props} />;
});

export default connect(
    {
        fileIdDescription: state`checklist.fileIdDescription`,
        signalSaveDescription: signal`checklist.saveDescription`,

        filesForm: state`checklist.filesForm`,
        photosForm: state`checklist.photosForm`,

        signalLoadFilesAndPhotos: signal`checklist.loadFilesAndPhotos`,
        signalResetFilesAndPhotos: signal`checklist.resetFilesAndPhotos`,

        signalAddFile: signal`checklist.addFile`,
        signalAddPhoto: signal`checklist.addPhoto`,

        signalRemoveFile: signal`checklist.removeFile`,
        signalEditDescription: signal`checklist.editDescription`,
    },
    composed
);
