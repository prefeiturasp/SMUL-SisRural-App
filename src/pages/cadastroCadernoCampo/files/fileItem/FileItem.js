import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Text, Touchable, ViewSmart } from '../../../../components';
import Theme from '../../../../Theme';
import { openUrl } from '../../../../utils/AppUtil';
import styles from './FileItem.styles';

class FileItem extends React.Component {
    static propTypes = {
        data: PropTypes.shape({
            app_arquivo: PropTypes.string,
            arquivo: PropTypes.string,
        }),

        onDeletePress: PropTypes.func,
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

    isFinalizado() {
        return this.props.caderno && this.props.caderno.status === 'finalizado';
    }

    render() {
        const { onDeletePress } = this.props;

        const { app_arquivo, arquivo } = this.props.data;

        return (
            <View style={styles.file}>
                <View style={styles.fileAttach}>
                    <MaterialIcons color={Theme.colors.coolGrey} size={24} name="attach-file" />
                </View>

                <View style={styles.fileTexts}>
                    <Text size16 fontBold>
                        {app_arquivo || arquivo.split('/').pop()}
                    </Text>

                    <ViewSmart row>
                        <Touchable onPress={this.onViewPress}>
                            <Text teal size14>
                                Visualizar
                            </Text>
                        </Touchable>

                        {!!onDeletePress && (
                            <React.Fragment>
                                <Text teal size14>
                                    {'  |  '}
                                </Text>

                                <Touchable onPress={this.onDeletePress}>
                                    <Text teal size14>
                                        Remover
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

export default FileItem;
