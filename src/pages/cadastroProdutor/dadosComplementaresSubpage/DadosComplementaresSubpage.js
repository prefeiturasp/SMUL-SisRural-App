import {
    Button,
    ComponentConnect,
    DropdownMaterial,
    DropdownSearchable,
    HideElement,
    QueryDb,
    ShowElement,
    Spacer,
    TextInputMaterial,
} from '../../../components';
import { ScrollView, StyleSheet } from 'react-native';
import { signal, state } from 'cerebral/tags';

import React from 'react';
import { connect } from '@cerebral/react';
import { form } from '@cerebral/forms';

const styles = StyleSheet.create({
    scrollview: {
        flexGrow: 1,
    },
});

class DadosComplementaresSubpage extends React.PureComponent {
    static propTypes = {};

    constructor(props) {
        super(props);
    }

    onSalvarPress = () => {
        this.props.signalSalvarProdutor();
    };

    onDisabledPress = () => {
        this.props.touchForm({ form: 'produtor.formProdutor' });
    };

    onDropdownFocus = () => {
        setTimeout(() => {
            this._scrollview.scrollTo({ x: 0, y: this._scrollY + 150, animated: true });
        }, 500);
    };

    _scrollview = null;
    _scrollY = null;

    handleScroll = (event) => {
        this._scrollY = event.nativeEvent.contentOffset.y;
    };

    render() {
        const { formProdutor } = this.props;

        return (
            <ScrollView
                onScroll={this.handleScroll}
                ref={(e) => (this._scrollview = e)}
                contentContainerStyle={styles.scrollview}
                keyboardShouldPersistTaps={'handled'}
            >
                <Spacer horizontal={4}>
                    {/* <ComponentConnect path="produtor.formProdutor.tipo">
                        <DropdownMaterial
                            label="Tipo do Produtor"
                            data={[
                                {
                                    label: 'Individual',
                                    value: 'individual',
                                },
                                {
                                    label: 'Familiar',
                                    value: 'familiar',
                                },
                            ]}
                        />
                    </ComponentConnect> */}

                    <ComponentConnect path="produtor.formProdutor.nome_social">
                        <TextInputMaterial label="Nome Social" />
                    </ComponentConnect>

                    <ComponentConnect path="produtor.formProdutor.email">
                        <TextInputMaterial label="E-mail" />
                    </ComponentConnect>

                    <QueryDb query={'select * from generos WHERE deleted_at IS NULL'}>
                        {(data) => {
                            return (
                                <ComponentConnect path="produtor.formProdutor.genero_id">
                                    <DropdownMaterial
                                        label="Gênero"
                                        data={data.map((v) => {
                                            return { value: v.id, label: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <QueryDb query={'select * from etinias WHERE deleted_at IS NULL'}>
                        {(data) => {
                            return (
                                <ComponentConnect path="produtor.formProdutor.etinia_id">
                                    <DropdownMaterial
                                        label="Cor, Raça & Etinia"
                                        data={data.map((v) => {
                                            return { value: v.id, label: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <ComponentConnect path="produtor.formProdutor.fl_portador_deficiencia">
                        <DropdownMaterial
                            label="Portador de Necessidades Especiais"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="produtor.formProdutor.fl_portador_deficiencia">
                        <ComponentConnect path="produtor.formProdutor.portador_deficiencia_obs">
                            <TextInputMaterial label="Tipo de Necessidade Especial" />
                        </ComponentConnect>
                    </ShowElement>

                    <ComponentConnect path="produtor.formProdutor.data_nascimento">
                        <TextInputMaterial label="Data de Nascimento" mask="99/99/9999" maxLength={10} />
                    </ComponentConnect>

                    <ComponentConnect path="produtor.formProdutor.rg">
                        <TextInputMaterial label="RG" />
                    </ComponentConnect>

                    <ComponentConnect path="produtor.formProdutor.fl_cnpj">
                        <DropdownMaterial
                            label="Possui CNPJ?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="produtor.formProdutor.fl_cnpj">
                        <ComponentConnect path="produtor.formProdutor.cnpj">
                            <TextInputMaterial
                                label="CNPJ"
                                mask="99.999.999/9999-99"
                                keyboardType="numeric"
                                maxLength={18}
                            />
                        </ComponentConnect>
                    </ShowElement>

                    <ComponentConnect path="produtor.formProdutor.fl_nota_fiscal_produtor">
                        <DropdownMaterial
                            label="Possui Nota Fiscal de Produtor?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="produtor.formProdutor.fl_nota_fiscal_produtor">
                        <ComponentConnect path="produtor.formProdutor.nota_fiscal_produtor">
                            <TextInputMaterial label="Nota Fiscal de Produtor" />
                        </ComponentConnect>
                    </ShowElement>

                    <ComponentConnect path="produtor.formProdutor.fl_agricultor_familiar">
                        <DropdownMaterial
                            label="É Agricultor Familiar?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="produtor.formProdutor.fl_agricultor_familiar">
                        <ComponentConnect path="produtor.formProdutor.fl_agricultor_familiar_dap">
                            <DropdownMaterial
                                label="Possui DAP?"
                                data={[
                                    { value: null, label: 'Sem resposta' },
                                    { value: 1, label: 'Sim' },
                                    { value: 0, label: 'Não' },
                                ]}
                            />
                        </ComponentConnect>

                        <ShowElement path="produtor.formProdutor.fl_agricultor_familiar_dap">
                            <ComponentConnect path="produtor.formProdutor.agricultor_familiar_numero">
                                <TextInputMaterial label="Número DAP" />
                            </ComponentConnect>

                            <ComponentConnect path="produtor.formProdutor.agricultor_familiar_data">
                                <TextInputMaterial label="Validade DAP" mask="99/99/9999" />
                            </ComponentConnect>
                        </ShowElement>
                    </ShowElement>

                    <ComponentConnect path="produtor.formProdutor.fl_assistencia_tecnica">
                        <DropdownMaterial
                            label="Recebe Assistência Técnica?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="produtor.formProdutor.fl_assistencia_tecnica">
                        <QueryDb query={'select * from assistencia_tecnica_tipos WHERE deleted_at IS NULL'}>
                            {(data) => {
                                return (
                                    <ComponentConnect path="produtor.formProdutor.assistencia_tecnica_tipo_id">
                                        <DropdownMaterial
                                            label="Qual o Tipo da Assistência Técnica"
                                            data={data.map((v) => {
                                                return { value: v.id, label: v.nome };
                                            })}
                                        />
                                    </ComponentConnect>
                                );
                            }}
                        </QueryDb>

                        <ComponentConnect path="produtor.formProdutor.assistencia_tecnica_periodo">
                            <TextInputMaterial label="Periodicidade da Assistência Técnica" />
                        </ComponentConnect>
                    </ShowElement>

                    <ComponentConnect path="produtor.formProdutor.fl_comunidade_tradicional">
                        <DropdownMaterial
                            label="É de Comunidade Tradicional?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="produtor.formProdutor.fl_comunidade_tradicional">
                        <ComponentConnect path="produtor.formProdutor.comunidade_tradicional_obs">
                            <TextInputMaterial label="Qual Comunidade Tradicional?" />
                        </ComponentConnect>
                    </ShowElement>

                    <ComponentConnect path="produtor.formProdutor.fl_internet">
                        <DropdownMaterial
                            label="Acessa a Internet?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ComponentConnect path="produtor.formProdutor.fl_tipo_parceria">
                        <DropdownMaterial
                            label="Participa de Cooperativa, Associação, Rede, Movimento ou Coletivo?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <ShowElement path="produtor.formProdutor.fl_tipo_parceria">
                        <ComponentConnect path="produtor.formProdutor.tipo_parcerias_obs">
                            <TextInputMaterial label="Qual?" />
                        </ComponentConnect>
                    </ShowElement>

                    <QueryDb query={'select * from renda_agriculturas order by nome COLLATE NOCASE ASC'}>
                        {(data) => {
                            return (
                                <ComponentConnect path="produtor.formProdutor.renda_agricultura_id">
                                    <DropdownMaterial
                                        label="% da renda advinda da agricultura"
                                        data={data.map((v) => {
                                            return { value: v.id, label: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <QueryDb query={'select * from rendimento_comercializacoes order by nome COLLATE NOCASE ASC'}>
                        {(data) => {
                            return (
                                <ComponentConnect path="produtor.formProdutor.rendimento_comercializacao_id">
                                    <DropdownMaterial
                                        label="Rendimento da comercialização"
                                        data={data.map((v) => {
                                            return { value: v.id, label: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <ComponentConnect path="produtor.formProdutor.outras_fontes_renda">
                        <TextInputMaterial label="Outras fontes de renda" />
                    </ComponentConnect>

                    <QueryDb query={'select * from grau_instrucoes order by nome COLLATE NOCASE ASC'}>
                        {(data) => {
                            return (
                                <ComponentConnect path="produtor.formProdutor.grau_instrucao_id">
                                    <DropdownMaterial
                                        label="Grau de instrução"
                                        data={data.map((v) => {
                                            return { value: v.id, label: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <ComponentConnect path="produtor.formProdutor.fl_reside_unidade_produtiva">
                        <DropdownMaterial
                            label="Reside na Unidade Produtiva?"
                            data={[
                                { value: null, label: 'Sem resposta' },
                                { value: 1, label: 'Sim' },
                                { value: 0, label: 'Não' },
                            ]}
                        />
                    </ComponentConnect>

                    <HideElement path="produtor.formProdutor.fl_reside_unidade_produtiva">
                        <ComponentConnect path="produtor.formProdutor.cep">
                            <TextInputMaterial label="CEP" mask="99999-999" keyboardType="numeric" maxLength={9} />
                        </ComponentConnect>

                        <ComponentConnect path="produtor.formProdutor.endereco">
                            <TextInputMaterial label="Endereço" />
                        </ComponentConnect>

                        <ComponentConnect path="produtor.formProdutor.bairro">
                            <TextInputMaterial label="Bairro" />
                        </ComponentConnect>
                    </HideElement>


                    <QueryDb query={'select * from estados order by nome COLLATE NOCASE ASC'}>
                        {(data) => {
                            return (
                                <ComponentConnect path="produtor.formProdutor.estado_id">
                                    <DropdownMaterial
                                        label="Estado"
                                        data={data.map((v) => {
                                            return { value: v.id, label: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <QueryDb
                        query={'select * from cidades where estado_id=:estado_id order by nome COLLATE NOCASE ASC'}
                        params={[this.props.formProdutor.estado_id.value]}
                    >
                        {(data) => {
                            return (
                                <ComponentConnect path={'produtor.formProdutor.cidade_id'}>
                                    <DropdownSearchable
                                        onFocus={this.onDropdownFocus}
                                        label="Cidade"
                                        data={data.map((v) => {
                                            return { id: v.id, nome: v.nome };
                                        })}
                                    />
                                </ComponentConnect>
                            );
                        }}
                    </QueryDb>

                    <Spacer vertical={2} />

                    <Button
                        mode="contained"
                        disabled={!formProdutor.isValid}
                        onPress={this.onSalvarPress}
                        onDisabledPress={this.onDisabledPress}
                    >
                        SALVAR E CONCLUIR
                    </Button>

                    <Spacer vertical={2} />
                </Spacer>
            </ScrollView>
        );
    }
}

export default connect(
    {
        touchForm: signal`form.touchForm`,

        formProdutor: form(state`produtor.formProdutor`),

        signalSalvarProdutor: signal`produtor.salvarProdutor`,
    },
    DadosComplementaresSubpage
);
