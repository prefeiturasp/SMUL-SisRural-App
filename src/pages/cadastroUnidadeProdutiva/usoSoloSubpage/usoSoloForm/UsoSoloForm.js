import { connect } from '@cerebral/react';
import { props, state } from 'cerebral/tags';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import {
    BarTitleArrow,
    Button,
    ComponentConnect,
    DropdownMaterial,
    QueryDb,
    ShowElement,
    Spacer,
    TextInputMaterial,
} from '../../../../components';
import styles from './UsoSoloForm.styles';

class UsoSoloForm extends React.Component {
    static propTypes = {
        path: PropTypes.string,

        expanded: PropTypes.bool,
    };

    static defaultProps = {};

    _dataSoloCategorias = [];

    constructor(props) {
        super(props);

        this.state = { expanded: props.expanded };
    }

    onExpandPress = () => {
        this.setState({
            expanded: !this.state.expanded,
        });
    };

    onRemovePress = () => {
        this.props.onRemovePress(this.props.position);
    };

    render() {
        const { expanded } = this.state;

        if (!this.props.form) {
            return null;
        }

        const { path, position } = this.props;

        return (
            <View style={styles.root}>
                <BarTitleArrow title={`Uso do Solo ${position + 1}`} expanded={expanded} onPress={this.onExpandPress} />

                <Collapsible collapsed={!expanded}>
                    <Spacer horizontal={4} bottom={8}>
                        <QueryDb query={"select * from solo_categorias where tipo = 'geral' AND deleted_at IS NULL"}>
                            {dataSoloCategorias => {
                                this._dataSoloCategorias = dataSoloCategorias;

                                return (
                                    <ComponentConnect path={`${path}.solo_categoria_id`}>
                                        <DropdownMaterial
                                            label="Categoria"
                                            data={dataSoloCategorias.map(v => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

                        <ShowElement path={`${path}.solo_categoria_id`}>
                            <ComponentConnect path={`${path}.area`}>
                                <TextInputMaterial label="Área (Heactares)" keyboardType="numeric" />
                            </ComponentConnect>
                        </ShowElement>

                        <ShowElement
                            path={`${path}.solo_categoria_id`}
                            matchValue={v => {
                                const selected = this._dataSoloCategorias.filter(vv => vv.id === v)[0];

                                if (selected && v && selected.tipo_form && selected.tipo_form === 'todos') {
                                    return true;
                                }

                                return false;
                            }}
                        >
                            <ComponentConnect path={`${path}.quantidade`}>
                                <TextInputMaterial label="Quantidade de Espécies" keyboardType="numeric" />
                            </ComponentConnect>

                            <ComponentConnect path={`${path}.descricao`}>
                                <TextInputMaterial label="Descrição" />
                            </ComponentConnect>
                        </ShowElement>

                        <Spacer vertical={2} />

                        <Button icon="trash-can-outline" mode="text" onPress={this.onRemovePress}>
                            CLIQUE PARA REMOVER
                        </Button>
                    </Spacer>
                </Collapsible>
            </View>
        );
    }
}

export default connect(
    {
        form: state`${props`path`}`,
    },
    UsoSoloForm
);
