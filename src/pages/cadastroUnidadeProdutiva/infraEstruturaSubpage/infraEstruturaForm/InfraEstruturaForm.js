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
    Spacer,
    TextInputMaterial,
} from '../../../../components';
import styles from './InfraEstruturaForm.styles';

class InfraEstruturaForm extends React.Component {
    static propTypes = {
        path: PropTypes.string,

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

    onRemovePress = () => {
        this.props.onRemovePress(this.props.position);
    };

    render() {
        const { expanded } = this.state;

        if (!this.props.form) {
            return null;
        }

        const { path, position } = this.props;

        const instalacao_tipo_id = this.props.form.instalacao_tipo_id.value;

        return (
            <View style={styles.root}>
                <BarTitleArrow
                    title={`Infra-estrutura ${position + 1}`}
                    expanded={expanded}
                    onPress={this.onExpandPress}
                />

                <Collapsible collapsed={!expanded}>
                    <Spacer horizontal={4} bottom={8}>
                        <QueryDb query={'select * from instalacao_tipos WHERE deleted_at IS NULL'}>
                            {data => {
                                return (
                                    <ComponentConnect path={`${path}.instalacao_tipo_id`}>
                                        <DropdownMaterial
                                            label="Tipo"
                                            data={data.map(v => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

                        <ComponentConnect path={`${path}.descricao`}>
                            <TextInputMaterial label="Descrição" />
                        </ComponentConnect>

                        <ComponentConnect path={`${path}.quantidade`}>
                            <TextInputMaterial label="Quantidade" keyboardType="numeric" />
                        </ComponentConnect>

                        {instalacao_tipo_id !== 2 && instalacao_tipo_id !== 3 && (
                            <ComponentConnect path={`${path}.area`}>
                                <TextInputMaterial label="Área (Hectares)" keyboardType="numeric" />
                            </ComponentConnect>
                        )}

                        <ComponentConnect path={`${path}.observacao`}>
                            <TextInputMaterial label="Observação" />
                        </ComponentConnect>

                        {/* <ComponentConnect path={`${path}.localizacao`}>
                            <TextInputMaterial label="Localização" />
                        </ComponentConnect> */}

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
    InfraEstruturaForm
);
