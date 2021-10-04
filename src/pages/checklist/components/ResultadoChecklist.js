import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import orderBy from 'lodash/orderBy';
import values from 'lodash/values';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { Loading, Separator, Spacer } from '../../../components';
import PontuacaoSemaforica from './PontuacaoSemaforica';
import styles from './ResultadoChecklist.styles';

class ResultadoChecklist extends React.Component {
    static propTypes = { requestResultado: PropTypes.any, signalCarregar: PropTypes.func, isOnline: PropTypes.bool };

    static defaultProps = {};

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { signalCarregar, checklistUnidadeProdutivaId } = this.props;
        signalCarregar({ checklistUnidadeProdutivaId });
    }

    componentWillUnmount() {
        this.props.signalResetRequest({ path: 'checklist.requestResultado' });
    }

    render() {
        const { requestResultado } = this.props;

        if (requestResultado.loading && this.props.isOnline) {
            return (
                <View style={styles.box}>
                    <Spacer horizontal={4} bottom={2}>
                        <Loading />
                    </Spacer>
                </View>
            );
        }

        if (!requestResultado.result || !requestResultado.result.data) {
            return null;
        }

        const { data } = requestResultado.result;

        return (
            <View style={styles.box}>
                <PontuacaoSemaforica
                    titulo="Pontuação Final"
                    total={data.pontuacaoFinal}
                    pontuacaoRealizada={data.pontuacao}
                    // pontuacaoPercentual={data.pontuacaoPercentual}
                    boldValues={true}
                    semaforica={data.coresRespostas}
                    formula={data.formula}
                    collapsible={false}
                />

                {orderBy(values(data.categorias), 'ordem', 'asc').map(categoria => {
                    if (!categoria.coresRespostas) {
                        return null;
                    }

                    return (
                        <React.Fragment key={categoria.id.toString()}>
                            <Spacer horizontal={2} vertical={0}>
                                <Separator />
                            </Spacer>

                            <PontuacaoSemaforica
                                titulo={categoria.nome}
                                total={categoria.pontuacaoMobile}
                                pontuacaoRealizada={categoria.pontuacao}
                                pontuacaoPercentual={categoria.pontuacaoPercentual}
                                semaforica={categoria.coresRespostas}
                                collapsible={true}
                            />
                        </React.Fragment>
                    );
                })}
            </View>
        );
    }
}

export default connect(
    {
        requestResultado: state`checklist.requestResultado`,
        isOnline: state`offline.isOnline`,
        signalCarregar: signal`checklist.carregarResultado`,
        signalResetRequest: signal`form.resetRequest`,
    },
    ResultadoChecklist
);
