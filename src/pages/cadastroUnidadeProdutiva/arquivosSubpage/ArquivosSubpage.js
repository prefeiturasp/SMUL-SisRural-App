import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button, Spacer, Text, Touchable, ViewSmart } from '../../../components';
import Theme from '../../../Theme';
import FileItem from '../../cadastroCadernoCampo/files/fileItem/FileItem';

class ArquivosSubpage extends React.Component {
    static propTypes = {};

    onSalvarPress = () => {
        this.props.signalSalvar();
    };

    onDisabledPress = () => {};

    onAddpress = async () => {
        this.props.signalAddArquivo();
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

    onDeletePress = position => {
        this.props.signalRemoveArquivo({ position });
    };

    render() {
        const { arquivosForm } = this.props;

        return (
            <ScrollView keyboardShouldPersistTaps={'handled'}>
                <Spacer horizontal={4} top={4} bottom={0}>
                    {arquivosForm.map((v, k) => {
                        return <FileItem key={k} data={v} onDeletePress={this.onDeletePress.bind(this, k)} />;
                    })}
                </Spacer>

                {this.renderAddButton()}

                <ViewSmart flex1 />

                <Spacer />

                <Spacer horizontal={4}>
                    <Button
                        mode="contained"
                        disabled={!arquivosForm.length > 0}
                        onPress={this.onSalvarPress}
                        onDisabledPress={this.onDisabledPress}
                    >
                        SALVAR
                    </Button>

                    <Spacer vertical={2} />
                </Spacer>
            </ScrollView>
        );
    }
}

export default connect(
    {
        arquivosForm: state`unidProdutiva.arquivosForm`,
        signalAddArquivo: signal`unidProdutiva.addArquivo`,
        signalRemoveArquivo: signal`unidProdutiva.removeArquivo`,
        signalSalvar: signal`unidProdutiva.salvarArquivos`,
    },
    ArquivosSubpage
);
