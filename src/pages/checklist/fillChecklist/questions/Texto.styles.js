import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { Button, Spacer, Text, withDb } from '../../../../components';
import styles from './Semaforica.styles';

const COLORS = {
    verde: '#0F0',
    amarelo: '#FF0',
    vermelho: '#F00',
    cinza: '#555',
};

class Semaforica extends React.Component {
    static propTypes = {
        respostas: PropTypes.array.isRequired,
        checklistPergunta: PropTypes.object.isRequired,
    };

    onBtnPress = resposta => {};

    renderRespostas = () => {
        return this.props.respostas.map(resposta => {
            return (
                <Button
                    icon={() =>
                        resposta.cor && (
                            <View
                                style={{
                                    width: 10,
                                    height: 22,
                                    backgroundColor: COLORS[resposta.cor],
                                }}
                            />
                        )
                    }
                    onPress={this.onBtnPress.bind(this, resposta)}
                    style={styles.btn}
                >
                    {resposta.descricao}
                </Button>
            );
        });
    };

    render() {
        return (
            <View>
                <Spacer vertical={2} />
                <Text greyBlue fontBold size12>
                    ESCOLHA A RESPOSTA
                </Text>
                <Spacer />
                <View style={styles.options}>{this.renderRespostas()}</View>
            </View>
        );
    }
}

const QUERY = `
select * from respostas where pergunta_id = :perguntaId and deleted_at is null order by ordem asc
`;

export default withDb(QUERY, [props => props.checklistPergunta.pergunta.id], 'respostas')(Semaforica);
