import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Spacer, Text, Touchable, ViewSmart } from '../../../components';
import DetachedTabBar from '../../../components/tabViewMaterial/DetachedTabBar';
import Theme from '../../../Theme';
import FileItem from './fileItem/FileItem';

class FilesSubpage extends React.Component {
    static propTypes = {
        permiteAlterar: PropTypes.bool,
    };

    onAddpress = async () => {
        if (!this.props.permiteAlterar) {
            return;
        }

        this.props.signalAddFile();
    };

    renderAddButton = () => {
        return (
            <Touchable onPress={this.onAddpress}>
                <Spacer horizontal={2} vertical={2}>
                    <ViewSmart row alignCenter justifyCenter>
                        <MaterialCommunityIcons color={Theme.colors.teal} size={20} name="plus-circle-outline" />

                        <Spacer>
                            <Text size12 teal>
                                CLIQUE AQUI PARA ADICIONAR UM ARQUIVO
                            </Text>
                        </Spacer>
                    </ViewSmart>
                </Spacer>
            </Touchable>
        );
    };

    onDeletePress = (position) => {
        this.props.signalRemoveFile({ position });
    };

    isFinalizado() {
        return this.props.caderno && this.props.caderno.status === 'finalizado';
    }

    render() {
        if (!this.props.caderno) {
            return <Spacer />;
        }

        const { filesForm, permiteAlterar } = this.props;

        const isFinalizado = this.isFinalizado();

        return (
            <ScrollView keyboardShouldPersistTaps={'handled'}>
                <Spacer horizontal={4}>
                    <DetachedTabBar>ANEXOS</DetachedTabBar>
                </Spacer>

                {filesForm && filesForm.length === 0 && (
                    <ViewSmart alignCenter>
                        <Spacer />
                        <Text size14 coolGrey>
                            Não há nenhum anexo.
                        </Text>
                    </ViewSmart>
                )}

                <Spacer horizontal={4} top={4} bottom={0}>
                    {filesForm.map((v, k) => {
                        return (
                            <FileItem
                                key={k}
                                data={v}
                                onDeletePress={isFinalizado && permiteAlterar ? null : this.onDeletePress.bind(this, k)}
                            />
                        );
                    })}
                </Spacer>

                {!isFinalizado && permiteAlterar && this.renderAddButton()}
            </ScrollView>
        );
    }
}

export default connect(
    {
        caderno: state`cadernoCampo.cadernoData`,
        filesForm: state`cadernoCampo.filesForm`,
        signalAddFile: signal`cadernoCampo.addFile`,
        signalRemoveFile: signal`cadernoCampo.removeFile`,
    },
    FilesSubpage
);
