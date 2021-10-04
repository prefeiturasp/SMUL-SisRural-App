import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { SmartIcon, Spacer, Text, Touchable, ViewSmart } from '../../../components';
import Theme from '../../../Theme';
import styles from './PontuacaoSemaforica.styles';

class PontuacaoSemaforica extends React.Component {
    static propTypes = {
        titulo: PropTypes.string,
        boldValues: PropTypes.bool,
        total: PropTypes.any,
        collapsible: PropTypes.bool,
        semaforica: PropTypes.shape({
            verde: PropTypes.number,
            amarelo: PropTypes.number,
            vermelho: PropTypes.number,
            cinza: PropTypes.number,
        }).isRequired,
        formula: PropTypes.shape({
            resultado: PropTypes.string,
            formula: PropTypes.string,
            plain: PropTypes.string,
        }),
    };

    static defaultProps = {
        boldValues: false,
        sufixoTotal: '',
        semaforica: { verde: 0, amarelo: 0, vermelho: 0, cinza: 0 },
    };

    constructor(props) {
        super(props);
        this.state = { collapsed: props.collapsible };
    }

    onToggleCollapsed() {
        this.setState(prevState => ({ collapsed: !prevState.collapsed }));
    }

    render() {
        const {
            titulo,
            total,
            pontuacaoRealizada,
            pontuacaoPercentual,
            boldValues,
            collapsible,
            semaforica,
            formula,
        } = this.props;
        const { collapsed } = this.state;

        const collapsibleIcon = collapsed ? 'materialicons@arrow-drop-down' : 'materialicons@arrow-drop-up';
        return (
            <>
                <Touchable style={styles.header} onPress={this.onToggleCollapsed.bind(this)} disabled={!collapsible}>
                    <Text size16 style={styles.title}>
                        {titulo}
                    </Text>

                    <Spacer />

                    <ViewSmart row alignCenter>
                        <Text size16 fontBold={boldValues}>
                            {total}
                        </Text>

                        <Spacer />

                        {collapsible && <SmartIcon icon={collapsibleIcon} color={Theme.colors.slateGrey} size={24} />}
                    </ViewSmart>
                </Touchable>

                {!!formula && (
                    <Spacer vertical={0} horizontal={2}>
                        <View style={styles.item}>
                            <View style={styles.itemLabel}>
                                <Text size14 slateGrey>
                                    Fórmula Aplicada
                                </Text>
                            </View>

                            <View style={[styles.itemColor, styles.semaforicaNumerica]}>
                                <Text size14 slateGrey fontBold={boldValues}>
                                    {formula.plain}
                                </Text>
                            </View>
                        </View>
                    </Spacer>
                )}

                <Collapsible collapsed={collapsed}>
                    <Spacer top={1} bottom={3} horizontal={2}>
                        <View style={styles.item}>
                            <View style={styles.itemLabel}>
                                <Text size14 slateGrey>
                                    Verde
                                </Text>
                            </View>
                            <View style={[styles.itemColor, styles.semaforicaGreen]}>
                                <Text size14 slateGrey fontBold={boldValues}>
                                    {semaforica.verde} resposta(s)
                                </Text>
                            </View>
                        </View>
                        <View style={styles.item}>
                            <View style={styles.itemLabel}>
                                <Text size14 slateGrey>
                                    Amarelo
                                </Text>
                            </View>
                            <View style={[styles.itemColor, styles.semaforicaYellow]}>
                                <Text size14 slateGrey fontBold={boldValues}>
                                    {semaforica.amarelo} resposta(s)
                                </Text>
                            </View>
                        </View>
                        <View style={styles.item}>
                            <View style={styles.itemLabel}>
                                <Text size14 slateGrey>
                                    Vermelho
                                </Text>
                            </View>
                            <View style={[styles.itemColor, styles.semaforicaRed]}>
                                <Text size14 slateGrey fontBold={boldValues}>
                                    {semaforica.vermelho} resposta(s)
                                </Text>
                            </View>
                        </View>
                        <View style={styles.item}>
                            <View style={styles.itemLabel}>
                                <Text size14 slateGrey>
                                    Não se aplica
                                </Text>
                            </View>
                            <View style={[styles.itemColor, styles.semaforicaGrey]}>
                                <Text size14 slateGrey fontBold={boldValues}>
                                    {semaforica.cinza} resposta(s)
                                </Text>
                            </View>
                        </View>
                        <View style={styles.item}>
                            <View style={styles.itemLabel}>
                                <Text size14 slateGrey>
                                    Numérica
                                </Text>
                            </View>
                            <View style={[styles.itemColor, styles.semaforicaNumerica]}>
                                <Text size14 slateGrey fontBold={boldValues}>
                                    {semaforica.numerica} resposta(s)
                                </Text>
                            </View>
                        </View>

                        {!!pontuacaoRealizada && (
                            <View style={styles.item}>
                                <View style={styles.itemLabel}>
                                    <Text size14 slateGrey>
                                        Pontuação realizada
                                    </Text>
                                </View>
                                <View style={[styles.itemColor, styles.semaforicaNumerica]}>
                                    <Text size14 slateGrey fontBold={boldValues}>
                                        {pontuacaoRealizada}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {!!pontuacaoPercentual && (
                            <View style={styles.item}>
                                <View style={styles.itemLabel}>
                                    <Text size14 slateGrey>
                                        Pontuação percentual
                                    </Text>
                                </View>
                                <View style={[styles.itemColor, styles.semaforicaNumerica]}>
                                    <Text size14 slateGrey fontBold={boldValues}>
                                        {pontuacaoPercentual}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </Spacer>
                </Collapsible>
            </>
        );
    }
}

export default PontuacaoSemaforica;
