import React from 'react';
import { View } from 'react-native';
import {
    Button,
    CollapsibleContent,
    QueryDb,
    Separator,
    Spacer,
    Text,
    Touchable,
    ViewSmart,
} from '../../../../components';
import styles from './BoxUnidadesProdutivas.styles';

const QUERY_UNIDADES_PRODUTIVAS = `
    SELECT PA.id,
           UP.nome AS nomeUnidadeProdutiva,
           P.nome AS nomeProdutor,
           UP.socios AS socios
      FROM plano_acoes PA,
           unidade_produtivas UP,
           produtores P
     WHERE PA.plano_acao_coletivo_id = :planoAcaoId
       AND UP.id = PA.unidade_produtiva_id
       AND P.id = PA.produtor_id
       AND PA.deleted_at IS NULL
`;

// AND UP.deleted_at IS NULL
// AND P.deleted_at IS NULL

class BoxUnidadesProdutivas extends React.Component {
    static propTypes = {};

    onAdicionarPress() {
        const { onAdicionarUnidadeProdutivaPlanoAcaoColetivoPress } = this.props;
        onAdicionarUnidadeProdutivaPlanoAcaoColetivoPress();
    }

    onUnidadeProdutivaPress(planoAcaoUnidadeId) {
        const { onUnidadeProdutivaPlanoAcaoColetivoPress } = this.props;
        onUnidadeProdutivaPlanoAcaoColetivoPress(planoAcaoUnidadeId);
    }

    render() {
        const { planoAcaoId, permiteAdicionar } = this.props;
        return (
            <Spacer horizontal={0} vertical={2} style={styles.box}>
                <CollapsibleContent
                    collapsed={false}
                    disableCollapse={permiteAdicionar}
                    header={
                        <View style={styles.boxHeader}>
                            <Text size18 fontBold slateGrey>
                                Unidades Produtivas
                            </Text>
                            {permiteAdicionar && (
                                <Button
                                    mode="contained"
                                    onPress={this.onAdicionarPress.bind(this)}
                                    style={styles.adicionarButton}
                                >
                                    Adicionar
                                </Button>
                            )}
                        </View>
                    }
                >
                    <QueryDb query={QUERY_UNIDADES_PRODUTIVAS} params={[planoAcaoId]}>
                        {data => (
                            <>
                                {data.length == 0 && (
                                    <ViewSmart alignCenter>
                                        <Spacer bottom={8} top={4}>
                                            <Text size18 slateGrey>
                                                Ainda não há unidades{`\n`}produtivas vinculadas
                                            </Text>
                                        </Spacer>
                                    </ViewSmart>
                                )}
                                {data.map((pdaUnidade, i) => {
                                    return (
                                        <React.Fragment key={i}>
                                            <Touchable onPress={this.onUnidadeProdutivaPress.bind(this, pdaUnidade.id)}>
                                                <Spacer horizontal={4} vertical={2}>
                                                    <Text size16 slateGrey fontBold>
                                                        {`Unidade Produtiva: ${pdaUnidade.nomeUnidadeProdutiva}`}
                                                    </Text>
                                                    <Text size14 slateGrey fontBold>
                                                        {`Produtor/a: ${pdaUnidade.nomeProdutor}`}
                                                    </Text>
                                                    {!!pdaUnidade.socios && (
                                                        <Text size14 slateGrey>
                                                            {`Coproprietários: ${pdaUnidade.socios}`}
                                                        </Text>
                                                    )}
                                                </Spacer>
                                            </Touchable>
                                            {i < data.length - 1 ? <Separator /> : <Spacer />}
                                        </React.Fragment>
                                    );
                                })}
                            </>
                        )}
                    </QueryDb>
                </CollapsibleContent>
            </Spacer>
        );
    }
}

export default BoxUnidadesProdutivas;
