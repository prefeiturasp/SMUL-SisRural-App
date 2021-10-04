import PropTypes from 'prop-types';
import React from 'react';
import { Image, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-picker';
import { Dialog, Paragraph, Portal } from 'react-native-paper';
import { getRepository } from 'typeorm/browser';
import { Button, Spacer, Text, Touchable } from '../../../../components';
import UnidadeProdutivaRespostaArquivo from '../../../../db/typeORM/UnidadeProdutivaRespostaArquivoModel';
import UnidadeProdutivaResposta from '../../../../db/typeORM/UnidadeProdutivaRespostaModel';
import Theme from '../../../../Theme';
import { isImage, openUrl } from '../../../../utils/AppUtil';
import styles from './Anexo.styles';

export async function applyChangesAnexo(checklistUnidadeProdutiva, perguntaId, changes) {
    const repo = getRepository(UnidadeProdutivaResposta);
    const fileRepo = getRepository(UnidadeProdutivaRespostaArquivo);

    let UPrespostaModel = await repo.findOne({
        pergunta_id: perguntaId,
        unidade_produtiva_id: checklistUnidadeProdutiva.unidade_produtiva_id,
    });

    if (!UPrespostaModel) {
        UPrespostaModel = repo.create({
            pergunta_id: perguntaId,
            unidade_produtiva_id: checklistUnidadeProdutiva.unidade_produtiva_id,
        });
    }

    UPrespostaModel.resposta = changes.value;
    UPrespostaModel.app_sync = 1;
    UPrespostaModel.deleted_at = null;

    await repo.save(UPrespostaModel);

    let fileModel = await fileRepo.findOne({
        unidade_produtiva_resposta_id: UPrespostaModel.id,
    });

    if (!fileModel) {
        fileModel = fileRepo.create({ unidade_produtiva_resposta_id: UPrespostaModel.id });
    }

    fileModel.app_sync = 1;
    fileModel.deleted_at = null;

    const response = changes.extraData.fileData;

    fileModel.arquivo = null;
    fileModel.app_arquivo = response.name;
    fileModel.app_arquivo_caminho = response.uri;

    await fileRepo.save(fileModel);
}

export default class Anexo extends React.Component {
    static propTypes = {
        checklistPergunta: PropTypes.object.isRequired,
        unidadeProdutivaRespostas: PropTypes.array,
        readOnly: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        const unidadeProdutivaResposta = props.unidadeProdutivaRespostas && props.unidadeProdutivaRespostas[0];

        this.state = {
            modalFile: false,
            value: unidadeProdutivaResposta ? unidadeProdutivaResposta.resposta + '' : '',
            fileData: null,
        };
    }

    onUpload = () => {
        if (this.props.readOnly) {
            return;
        }

        this.setState({ modalFile: true });
    };

    onTakePhoto = async () => {
        this.setState({ modalFile: false });

        const options = {
            title: 'Selecione a foto',
            cancelButtonTitle: 'Cancelar',
            takePhotoButtonTitle: 'Tirar uma foto',
            chooseFromLibraryButtonTitle: 'Selecione da biblioteca',

            quality: 0.6,
            mediaType: 'photo',
            cameraType: 'back',
            allowsEditing: false,
            noData: true,
            maxWidth: 1280,
            maxHeight: 1280,

            storageOptions: {
                skipBackup: true,
                waitUntilSaved: true,
                privateDirectory: true,
            },
        };

        ImagePicker.launchCamera(options, async (res) => {
            if (res.uri) {
                const filepath = RNFS.DocumentDirectoryPath + '/' + res.fileName;

                await RNFS.moveFile(res.uri, filepath);

                const newRes = {
                    ...res,
                    uri: filepath,
                };

                this.setState({ value: res.fileName, fileData: newRes });
                this.props.onChange(res.fileName, { fileData: newRes });
            }
        });
    };

    onTakeFile = async () => {
        this.setState({ modalFile: false });

        const res = await DocumentPicker.pick({
            type: [DocumentPicker.types.allFiles],
        });

        const filepath = RNFS.DocumentDirectoryPath + '/' + res.name;

        await RNFS.moveFile(res.uri, filepath);

        const newRes = {
            ...res,
            uri: filepath,
        };

        this.setState({ value: res.name, fileData: newRes });
        this.props.onChange(res.name, { fileData: newRes });
    };

    onOpenPress = () => {
        if (this.state.fileData) {
            FileViewer.open(this.state.fileData.uri);
        } else {
            openUrl(this.state.value);
        }
    };

    onCancel = () => {
        this.setState({ modalFile: false });
    };

    render() {
        const uri = this.state.fileData ? this.state.fileData.uri : this.state.value;

        return (
            <View>
                <Portal>
                    <Dialog
                        visible={this.state.modalFile}
                        onDismiss={() => {
                            this.setState({ modalFile: false });
                        }}
                    >
                        <Dialog.Content>
                            <Paragraph>Selecione uma das opções</Paragraph>

                            <Spacer />

                            <Button onPress={this.onTakePhoto} mode="text">
                                Tirar foto
                            </Button>

                            <Button onPress={this.onTakeFile} mode="text">
                                Escolher da biblioteca
                            </Button>

                            <Button onPress={this.onCancel} mode="text">
                                Cancelar
                            </Button>
                        </Dialog.Content>
                    </Dialog>
                </Portal>

                <Spacer vertical={2} />

                <Text greyBlue fontBold size12>
                    {this.props.readOnly ? 'ANEXO' : 'ANEXE UM ARQUIVO'}
                </Text>

                <Spacer />

                <View>
                    {!this.props.readOnly && (
                        <Button onPress={this.onUpload} style={styles.button} icon="attachment" mode="text">
                            fazer upload
                        </Button>
                    )}

                    {this.props.readOnly && !this.state.value && <Text>Nenhum arquivo anexado</Text>}

                    <Spacer vertical={1} />

                    {!!this.state.value && (
                        <Button
                            onPress={this.onOpenPress}
                            style={styles.buttonAttachment}
                            color={Theme.colors.lightGreen}
                        >
                            {this.state.value}
                        </Button>
                    )}

                    {isImage(uri) && (
                        <React.Fragment>
                            <Spacer vertical={1} />

                            <Touchable onPress={this.onOpenPress}>
                                <Image resizeMode="contain" style={styles.image} source={{ uri }} />
                            </Touchable>
                        </React.Fragment>
                    )}
                </View>
            </View>
        );
    }
}
