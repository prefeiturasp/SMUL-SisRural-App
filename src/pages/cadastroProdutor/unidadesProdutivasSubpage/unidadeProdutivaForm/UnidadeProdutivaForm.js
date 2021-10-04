import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import {
    BarTitleArrow,
    Button,
    ComponentConnect,
    DropdownMaterial,
    DropdownSearchable,
    QueryDb,
    Spacer,
} from '../../../../components';
import styles from './UnidadeProdutivaForm.styles';

class UnidadeProdutivaForm extends React.Component {
    static propTypes = {
        path: PropTypes.string,

        onDeletePress: PropTypes.func,
        expanded: PropTypes.bool,
    };

    static defaultProps = {};

    constructor(props) {
        super(props);

        this.state = { expanded: props.expanded };
    }

    onExpandPress = () => {
        this.setState({
            expanded: !this.state.expanded,
        });
    };

    onDeletePress = () => {
        const { position } = this.props;
        this.props.onDeletePress({ position });
    };

    render() {
        const { expanded } = this.state;

        const { path, position } = this.props;

        return (
            <View style={styles.root}>
                <BarTitleArrow title={`Propriedade ${position + 1}`} expanded={expanded} onPress={this.onExpandPress} />

                <Collapsible collapsed={!expanded}>
                    <Spacer horizontal={4} bottom={4}>
                        <QueryDb
                            query={
                                'select * from unidade_produtivas WHERE deleted_at IS NULL order by nome COLLATE NOCASE ASC'
                            }
                        >
                            {data => {
                                return (
                                    <ComponentConnect path={`${path}.unidade_produtiva_id`}>
                                        {/* <DropdownMaterial
                                            label="Nome da Propriedade"
                                            data={data.map(v => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        /> */}
                                        <DropdownSearchable
                                            label="Nome da Propriedade"
                                            data={data}
                                            // onFocus={this.onDropdownFocus}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

                        <QueryDb query={'select * from tipo_posses WHERE deleted_at IS NULL'}>
                            {data => {
                                return (
                                    <ComponentConnect path={`${path}.tipo_posse_id`}>
                                        <DropdownMaterial
                                            label="Tipo de Relação"
                                            data={data.map(v => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

                        <Spacer />

                        <Button icon="minus-circle-outline" mode="text" onPress={this.onDeletePress}>
                            DESVINCULAR PROPRIEDADE
                        </Button>
                    </Spacer>
                </Collapsible>
            </View>
        );
    }
}

export default UnidadeProdutivaForm;
