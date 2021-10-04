import PropTypes from 'prop-types';
import React from 'react';
import { Image, View } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import { Text, Touchable, ViewSmart } from '../../../../components';
import { openUrl } from '../../../../utils/AppUtil';
import styles from './PhotoItem.styles';

class PhotoItem extends React.Component {
    static propTypes = {
        data: PropTypes.shape({
            app_arquivo: PropTypes.string,
            arquivo: PropTypes.string,
            descricao: PropTypes.string,
        }),

        onDeletePress: PropTypes.func,
        onEditPress: PropTypes.func,
    };

    onViewPress = () => {
        const { app_arquivo_caminho, arquivo } = this.props.data;

        if (arquivo) {
            openUrl(arquivo);
        } else {
            FileViewer.open(app_arquivo_caminho);
        }
    };

    onDeletePress = () => {
        this.props.onDeletePress();
    };

    onEditPress = () => {
        this.props.onEditPress();
    };

    render() {
        const { onDeletePress, onEditPress } = this.props;

        //descricao
        const { app_arquivo, arquivo, descricao } = this.props.data;

        return (
            <View style={styles.file}>
                <Image style={styles.image} resizeMode={'cover'} source={{ uri: arquivo }} />

                <View style={styles.fileTexts}>
                    <Text size14>{descricao || app_arquivo || arquivo.split('/').pop()}</Text>

                    <ViewSmart row>
                        <Touchable onPress={this.onViewPress}>
                            <Text teal size12>
                                Visualizar
                            </Text>
                        </Touchable>

                        {!!onDeletePress && (
                            <React.Fragment>
                                <Text teal size12>
                                    {'  |  '}
                                </Text>

                                <Touchable onPress={this.onDeletePress}>
                                    <Text teal size12>
                                        Remover
                                    </Text>
                                </Touchable>
                            </React.Fragment>
                        )}

                        {!!onEditPress && (
                            <React.Fragment>
                                <Text teal size12>
                                    {'  |  '}
                                </Text>

                                <Touchable onPress={this.onEditPress}>
                                    <Text teal size12>
                                        Edit Descrição
                                    </Text>
                                </Touchable>
                            </React.Fragment>
                        )}
                    </ViewSmart>
                </View>
            </View>
        );
    }
}

export default PhotoItem;
