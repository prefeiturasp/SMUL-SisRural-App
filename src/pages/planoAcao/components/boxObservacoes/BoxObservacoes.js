import moment from 'moment';
import React from 'react';
import {
    Button,
    CollapsibleContent,
    ComponentConnect,
    Separator,
    Spacer,
    Text,
    TextInputPaper,
    ViewSmart,
} from '../../../../components';
import styles from './BoxObservacoes.styles';

class BoxObservacoes extends React.Component {
    static propTypes = {};

    onSalvarObservacaoPress() {
        const { onSalvarPress } = this.props;
        onSalvarPress();
    }

    render() {
        const { data, fieldTextoPath, permiteHistorico } = this.props;

        return (
            <Spacer horizontal={0} vertical={2} style={styles.box}>
                <CollapsibleContent
                    collapsed={false}
                    header={
                        <Text size18 fontBold slateGrey>
                            Acompanhamentos
                        </Text>
                    }
                >
                    {!!permiteHistorico && (
                        <Spacer horizontal={4} top={2}>
                            <ComponentConnect path={fieldTextoPath}>
                                <TextInputPaper mode="outlined" label="Acompanhamento" />
                            </ComponentConnect>

                            <ViewSmart row>
                                <Button
                                    icon="plus-circle"
                                    mode="text"
                                    onPress={this.onSalvarObservacaoPress.bind(this)}
                                >
                                    Adicionar novo acompanhamento
                                </Button>
                            </ViewSmart>
                        </Spacer>
                    )}

                    {data && data.length > 0 && (
                        <>
                            {data.map((obs, i) => {
                                let dataCriacao;
                                if (obs.created_at) {
                                    dataCriacao = moment.utc(obs.created_at).local().format('DD/MM/YYYY HH:mm');
                                } else {
                                    dataCriacao = moment().format('DD/MM/YYYY');
                                }
                                return (
                                    <Spacer key={i} horizontal={4}>
                                        <Text size14 slateGrey>
                                            {obs.texto}
                                        </Text>
                                        <Spacer horizontal={0} top={2} bottom={4}>
                                            <Text size10 slateGrey>
                                                {`Adicionada dia ${dataCriacao}`}
                                            </Text>
                                        </Spacer>
                                        {i < data.length - 1 && <Separator />}
                                    </Spacer>
                                );
                            })}
                        </>
                    )}
                </CollapsibleContent>
            </Spacer>
        );
    }
}

export default BoxObservacoes;
