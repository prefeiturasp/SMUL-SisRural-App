import React from 'react';
import { ScrollView, View } from 'react-native';
import { ActionRoute, Button, CardTitle, HeaderMenu, Spacer, withDb } from '../../components';
import styles from './FaleConoscoPage.styles';
import ItemListFaleConosco from './itemListFaleConosco/ItemListFaleConosco';

class FaleConoscoPage extends React.Component {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onHomePress = () => {
        ActionRoute.go('/home');
    };

    render() {
        const { unidades } = this.props;

        return (
            <View style={styles.root}>
                <HeaderMenu title={'Fale Conosco'} />

                <View style={styles.content}>
                    <CardTitle title="UNIDADES OPERACIONAIS" flex1 noBackground>
                        <ScrollView contentContainerStyle={styles.scrollview}>
                            {unidades.map(v => {
                                return (
                                    <ItemListFaleConosco
                                        key={v.id}
                                        text1={v.nome}
                                        text2={v.telefone}
                                        text3={v.endereco}
                                    />
                                );
                            })}
                        </ScrollView>
                    </CardTitle>
                </View>

                <Spacer vertical={4} horizontal={3}>
                    <Button mode="contained" onPress={this.onHomePress}>
                        VOLTAR PARA A HOME
                    </Button>
                </Spacer>
            </View>
        );
    }
}

const QUERY_UNIDADE_OPERACIONAIS =
    'select * from unidade_operacionais as UO WHERE UO.deleted_at IS NULL order by nome COLLATE NOCASE ASC';

export default withDb(QUERY_UNIDADE_OPERACIONAIS, [], 'unidades')(FaleConoscoPage);
