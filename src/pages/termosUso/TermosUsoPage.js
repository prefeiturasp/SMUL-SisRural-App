import React from 'react';
import { ScrollView, View } from 'react-native';
import { ActionRoute, Button, HtmlText, QueryDb, Spacer, Text } from '../../components';
import styles from './TermosUsoPage.styles';

class TermosUsoPage extends React.Component {
    constructor(props) {
        super(props);
    }

    onBackPress = () => {
        ActionRoute.replace('/login');
    };

    render() {
        return (
            <View style={styles.root}>
                <ScrollView contentContainerStyle={styles.scrollview} keyboardShouldPersistTaps={'handled'}>
                    <Spacer vertical={2} />

                    <Text size20 darkGrey alignCenter>
                        Termos de Uso
                    </Text>
                    <Spacer vertical={2} />

                    <Spacer vertical={0} horizontal={6}>
                        <QueryDb
                            query={'select texto from termos_de_usos where deleted_at is null order by updated_at desc'}
                        >
                            {data => {
                                return <HtmlText html={data[0].texto} />;
                            }}
                        </QueryDb>
                    </Spacer>
                </ScrollView>

                <View style={styles.hr}>
                    <Spacer vertical={4} horizontal={4}>
                        <Button mode="contained" onPress={this.onBackPress}>
                            VOLTAR
                        </Button>
                    </Spacer>
                </View>
            </View>
        );
    }
}

export default TermosUsoPage;
