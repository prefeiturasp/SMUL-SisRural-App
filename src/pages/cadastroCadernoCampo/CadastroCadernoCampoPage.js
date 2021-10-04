import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import moment from 'moment';
import React from 'react';
import { BASE_URL } from 'react-native-dotenv';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, DownloadablePdfShareButton, HeaderMenu, Spacer, Text, Touchable, ViewSmart } from '../../components';
import FilesSubpage from './files/FilesSubpage';
import FotosSubpage from './fotosSubpage/FotosSubpage';
import InformacoesSubpage from './informacoesSubpage/InformacoesSubpage';

class CadastroCadernoCampoPage extends React.Component {
    static propTypes = {};

    componentDidMount() {
        const { produtorId, unidadeProdutivaId, cadernoCampoId } = this.props.match.params;

        if (cadernoCampoId) {
            this.props.signalLoadCaderno({ cadernoCampoId });
        } else {
            if (!produtorId || !unidadeProdutivaId) {
                throw Error('É preciso ter um produtor/unidade produtiva para cadastrar um caderno de campo');
            }

            this.props.signalLoadData({
                produtorId,
                unidadeProdutivaId,
            });
        }
    }

    onFinishPress = () => {
        if (!this.props.permissoes.permiteAlterar) {
            return;
        }

        this.props.signalSave({
            status: 'finalizado',
        });
    };

    onDraftPress = () => {
        if (!this.props.permissoes.permiteAlterar) {
            return;
        }

        this.props.signalSave({
            status: 'rascunho',
        });
    };

    onDeletePress = () => {
        if (!this.props.permissoes.permiteDeletar) {
            return;
        }

        this.props.signalDelete({
            id: this.props.caderno.id,
        });
    };

    onSaveSilent = () => {
        this.props.signalSaveSilent();
    };

    isSaveEnabled = () => {
        return !(this.props.caderno && this.props.caderno.status === 'finalizado');
    };

    render() {
        const {
            permissoes: { permiteAlterar, permiteDeletar },
        } = this.props;

        return (
            <React.Fragment>
                <HeaderMenu title={this.props.caderno ? 'Caderno de Campo' : 'Novo Caderno de Campo'} />

                <ScrollView keyboardShouldPersistTaps={'handled'}>
                    <InformacoesSubpage permiteAlterar={permiteAlterar} />

                    <FotosSubpage permiteAlterar={permiteAlterar} onSaveSilent={this.onSaveSilent} />

                    <FilesSubpage permiteAlterar={permiteAlterar} onSaveSilent={this.onSaveSilent} />

                    <Spacer horizontal={4} top={4}>
                        {this.isSaveEnabled() && permiteAlterar && (
                            <Button onPress={this.onFinishPress}>CONCLUIR</Button>
                        )}

                        <Spacer vertical={1} />

                        <ViewSmart>
                            {this.isSaveEnabled() && permiteAlterar && (
                                <Touchable onPress={this.onDraftPress}>
                                    <Spacer horizontal={0} vertical={2}>
                                        <Text teal size16 fontMedium alignCenter>
                                            SALVAR COMO RASCUNHO
                                        </Text>
                                    </Spacer>
                                </Touchable>
                            )}

                            <Spacer />

                            {permiteDeletar && (
                                <React.Fragment>
                                    <Touchable onPress={this.onDeletePress}>
                                        <Spacer horizontal={0} vertical={2}>
                                            <Text red size16 fontMedium alignCenter>
                                                EXCLUIR CADERNO DE CAMPO
                                            </Text>
                                        </Spacer>
                                    </Touchable>

                                    <Spacer />
                                </React.Fragment>
                            )}

                            <Spacer />

                            {this.props.caderno && (
                                <DownloadablePdfShareButton
                                    url={`${BASE_URL}/caderno/pdf/${this.props.caderno.id}/${this.props.userId}`}
                                    pdfFileName="caderno-de-campo.pdf"
                                />
                            )}

                            {this.props.caderno && this.props.caderno.updated_at && (
                                <Text teal size14 greyBlue alignCenter>
                                    Última atualização em{' '}
                                    {moment
                                        .utc(this.props.caderno.updated_at)
                                        .local()
                                        .format('DD/MM/YYYY \\à\\s HH:mm')}
                                </Text>
                            )}

                            {this.props.caderno && this.props.caderno.created_at && (
                                <Text teal size12 greyBlue alignCenter>
                                    Criado em{' '}
                                    {moment
                                        .utc(this.props.caderno.created_at)
                                        .local()
                                        .format('DD/MM/YYYY \\à\\s HH:mm')}
                                </Text>
                            )}

                            {this.props.caderno && this.props.caderno.finished_at && (
                                <Text teal size12 greyBlue alignCenter>
                                    Finalizado em{' '}
                                    {moment
                                        .utc(this.props.caderno.finished_at)
                                        .local()
                                        .format('DD/MM/YYYY \\à\\s HH:mm')}
                                </Text>
                            )}

                            {this.props.caderno && this.props.caderno.user_finish && (
                                <Text teal size12 greyBlue alignCenter>
                                    Finalizado por {this.props.caderno.user_finish}
                                </Text>
                            )}

                            <Spacer vertical={2} />
                        </ViewSmart>
                    </Spacer>
                </ScrollView>
            </React.Fragment>
        );
    }
}

export default connect(
    {
        userId: state`auth.user.id`,

        caderno: state`cadernoCampo.cadernoData`,

        permissoes: state`cadernoCampo.permissoes`,

        signalLoadCaderno: signal`cadernoCampo.loadCaderno`,
        signalLoadData: signal`cadernoCampo.loadData`,
        signalSave: signal`cadernoCampo.save`,
        signalSaveSilent: signal`cadernoCampo.saveSilent`,

        signalDelete: signal`cadernoCampo.delete`,
    },
    CadastroCadernoCampoPage
);
