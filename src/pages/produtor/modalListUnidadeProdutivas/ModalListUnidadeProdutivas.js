import React from 'react';
import { ScrollView } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import { ItemListProfile, withDb } from '../../../components';
import { letters } from '../../../utils/StringUtil';

const styles = {
    scrollview: {
        flexGrow: 1,
        maxHeight: 300,
    },
};
class ModalListUnidadeProdutiva extends React.Component {
    onItemPress = item => {
        const { produtorId } = this.props;

        // TODO ARRUMAR
        ActionRoute.replace(`/produtor/${produtorId}`);
    };

    render() {
        const { list_unidades_produtivas } = this.props;

        if (list_unidades_produtivas.length === 0) {
            return null;
        }

        // Redireciona para a única unidade existente
        if (list_unidades_produtivas.length === 1) {
            requestAnimationFrame(() => {
                this.onItemPress(list_unidades_produtivas[0]);
            });

            return null;
        }

        return (
            <Portal>
                <Dialog dismissable={false} visible={true}>
                    <Dialog.Title>Selecione a Unidade Produtiva</Dialog.Title>
                    <Dialog.Content>
                        <ScrollView contentContainerStyle={styles.scrollview}>
                            {list_unidades_produtivas.map(v => {
                                return (
                                    <ItemListProfile
                                        key={v.id}
                                        letters={letters(v.nome)}
                                        text1={v.nome}
                                        onPress={this.onItemPress.bind(this, v)}
                                    />
                                );
                            })}
                        </ScrollView>
                    </Dialog.Content>
                </Dialog>
            </Portal>
        );
    }
}

const QUERY_LIST_UNIDADES_PRODUTIVAS =
    'select U.* from unidade_produtivas as U, produtor_unidade_produtiva as PU where PU.produtor_id = :id AND PU.unidade_produtiva_id = U.id AND PU.deleted_at IS NULL AND U.deleted_at IS NULL';

const withList = withDb(QUERY_LIST_UNIDADES_PRODUTIVAS, [props => props.produtorId], 'list_unidades_produtivas');

export default withList(ModalListUnidadeProdutiva);
