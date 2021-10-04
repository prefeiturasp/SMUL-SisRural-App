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
import styles from './PessoaForm.styles';

class PessoaForm extends React.Component {
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

        return (
            <View style={styles.root}>
                <BarTitleArrow title={`Pessoa ${position + 1}`} expanded={expanded} onPress={this.onExpandPress} />

                <Collapsible collapsed={!expanded}>
                    <Spacer horizontal={4} bottom={8}>
                        <ComponentConnect path={`${path}.nome`}>
                            <TextInputMaterial label="Nome Completo" />
                        </ComponentConnect>

                        <QueryDb query={'select * from relacoes WHERE deleted_at IS NULL'}>
                            {data => {
                                return (
                                    <ComponentConnect path={`${path}.relacao_id`}>
                                        <DropdownMaterial
                                            label="Relação"
                                            data={data.map(v => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

                        <ComponentConnect path={`${path}.cpf`}>
                            <TextInputMaterial
                                label="CPF"
                                mask="999.999.999-99"
                                keyboardType="numeric"
                                maxLength={14}
                            />
                        </ComponentConnect>

                        <ComponentConnect path={`${path}.funcao`}>
                            <TextInputMaterial label="Função" />
                        </ComponentConnect>

                        <QueryDb query={'select * from dedicacoes WHERE deleted_at IS NULL'}>
                            {data => {
                                return (
                                    <ComponentConnect path={`${path}.dedicacao_id`}>
                                        <DropdownMaterial
                                            label="Dedicação"
                                            data={data.map(v => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

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
    PessoaForm
);
