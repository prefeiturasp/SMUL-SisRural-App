import { connect } from '@cerebral/react';
import { signal } from 'cerebral/tags';
import React from 'react';
import { View } from 'react-native';
import { ActionRoute, Button, HeaderMenu, Spacer, Text } from '../../components';
import { makePromise } from '../../utils/CerebralUtil';
import styles from './SyncErrorPage.styles';

class SyncErrorPage extends React.Component {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onSyncClick = () => {
        const { promise, id } = makePromise();

        this.props.sync({
            onComplete: id,
        });

        promise.then(() => {
            ActionRoute.go('/home');
        });
    };

    onResetClick = () => {
        this.props.reset({});
    };

    render() {
        return (
            <View style={styles.root}>
                <HeaderMenu title={'Atenção'} />

                <View style={styles.content}>
                    <Text alignCenter size20>
                        Erro ao sincronizar dados
                    </Text>
                    <Spacer vertical={4} horizontal={0}>
                        <Text alignCenter>Não foi possível concluir a sincronização</Text>
                    </Spacer>
                    <Spacer vertical={4} horizontal={0}>
                        <Button onPress={this.onSyncClick} mode="contained">
                            SINCRONIZAR NOVAMENTE
                        </Button>
                    </Spacer>

                    <Spacer vertical={4} horizontal={0}>
                        <Button onPress={this.onResetClick} mode="contained">
                            LIMPAR BASE LOCAL
                        </Button>
                    </Spacer>
                </View>
            </View>
        );
    }
}

export default connect(
    {
        sync: signal`db.sync`,
        reset: signal`db.reset`,
    },
    SyncErrorPage
);
