import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { Text, SmartIcon, Touchable, ViewSmart, Spacer, QueryDb, Separator } from '../../../../components';

import styles from './ModalFiltro.styles';
import { Portal, Dialog, Button as PaperButton } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import { PLANO_ACAO_STATUS } from '../../../../modules/PlanoAcaoModule';
import { PLANO_ACAO_ITEM_PRIORIDADES, PLANO_ACAO_ITEM_STATUS } from '../../../../modules/PlanoAcaoItemModule';

const FILTRO_STATUS_PDA = [{ value: null, label: 'Todos', icon: null }, ...PLANO_ACAO_STATUS];
const FILTRO_STATUS_PDA_ITEM = [{ value: null, label: 'Todos', icon: null }, ...PLANO_ACAO_ITEM_STATUS];
const FILTRO_PRIORIDADE = [{ value: null, label: 'Todos', icon: null }, ...PLANO_ACAO_ITEM_PRIORIDADES.reverse()];

const FiltroItem = ({ tipo, data, selected, onSelecionar }) => {
    const selecionar = () => {
        onSelecionar(tipo, data);
    };

    return (
        <Touchable style={[styles.item, selected ? styles.itemSelecionado : null]} onPress={selecionar}>
            {data.icon && (
                <Spacer horizontal={0} vertical={0} right={2}>
                    <SmartIcon icon={`iconimage@${data.icon}`} size={20} />
                </Spacer>
            )}
            <Text slateGrey size16>
                {data.label}
            </Text>
        </Touchable>
    );
};

class ModalFiltro extends React.Component {
    static propTypes = {
        visible: PropTypes.bool,
        tipos: PropTypes.arrayOf(PropTypes.oneOf(['status_pda', 'status_pda_item', 'prioridade', 'checklist'])),
        statusValue: PropTypes.string,
        prioridadeValue: PropTypes.string,
    };
    constructor(props) {
        super(props);
        this.state = {
            stateStatusValue: props.statusValue,
            statePrioridadeValue: props.prioridadeValue,
            stateChecklistValue: props.checklistValue,
        };
    }

    confirmar() {
        const {
            stateStatusValue: status,
            statePrioridadeValue: prioridade,
            stateChecklistValue: checklist,
        } = this.state;
        this.props.onConfirmar({ status, prioridade, checklist });
    }

    cancelar() {
        this.props.onCancelar();
    }

    onSelecionar(tipo, data) {
        if (tipo == 'status' || tipo == 'status') {
            this.setState({ stateStatusValue: data.value });
        } else if (tipo == 'prioridade') {
            this.setState({ statePrioridadeValue: data.value });
        } else if (tipo == 'checklist') {
            this.setState({ stateChecklistValue: data.value });
        }
    }

    render() {
        const { tipos, visible } = this.props;
        const { stateStatusValue, statePrioridadeValue, stateChecklistValue } = this.state;

        let filtroStatus = null;
        let tituloFiltroStatus = null;
        if (tipos.includes('status_pda')) {
            tituloFiltroStatus = 'Status do Plano de Ação';
            filtroStatus = FILTRO_STATUS_PDA;
        } else if (tipos.includes('status_pda_item')) {
            tituloFiltroStatus = 'Status da Ação';
            filtroStatus = FILTRO_STATUS_PDA_ITEM;
        }

        return (
            <Portal>
                <Dialog visible={visible} onDismiss={this.cancelar.bind(this)} style={styles.dialog}>
                    <Dialog.ScrollArea style={styles.dialogContent}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            {!!filtroStatus && (
                                <>
                                    <View style={styles.item}>
                                        <Text coolGrey size14>
                                            {tituloFiltroStatus}
                                        </Text>
                                    </View>
                                    {filtroStatus.map((f, i) => (
                                        <FiltroItem
                                            key={`FS${i}`}
                                            data={f}
                                            tipo="status"
                                            selected={f.value == stateStatusValue}
                                            onSelecionar={this.onSelecionar.bind(this)}
                                        />
                                    ))}
                                    {(tipos.includes('prioridade') || tipos.includes('checklist')) && (
                                        <Spacer horizontal={0}>
                                            <Separator />
                                        </Spacer>
                                    )}
                                </>
                            )}

                            {tipos.includes('prioridade') && (
                                <>
                                    <View style={styles.item}>
                                        <Text coolGrey size14>
                                            Prioridade
                                        </Text>
                                    </View>
                                    {FILTRO_PRIORIDADE.map((f, i) => (
                                        <FiltroItem
                                            key={`FP${i}`}
                                            data={f}
                                            tipo="prioridade"
                                            selected={f.value == statePrioridadeValue}
                                            onSelecionar={this.onSelecionar.bind(this)}
                                        />
                                    ))}
                                    {tipos.includes('checklist') && (
                                        <Spacer horizontal={0}>
                                            <Separator />
                                        </Spacer>
                                    )}
                                </>
                            )}

                            {tipos.includes('checklist') && (
                                <>
                                    <View style={styles.item}>
                                        <Text coolGrey size14>
                                            Checklist
                                        </Text>
                                    </View>
                                    <QueryDb
                                        query={`select C.id as value, C.nome as label from checklists C WHERE status = 'publicado' ORDER by C.nome COLLATE NOCASE ASC LIMIT 15`}
                                    >
                                        {data => {
                                            return (
                                                <>
                                                    <FiltroItem
                                                        key={`CHTodos`}
                                                        data={{ label: 'Todos', value: null }}
                                                        tipo="checklist"
                                                        selected={stateChecklistValue == null}
                                                        onSelecionar={this.onSelecionar.bind(this)}
                                                    />
                                                    {data.map(f => (
                                                        <FiltroItem
                                                            key={`CH${f.value}`}
                                                            data={f}
                                                            tipo="checklist"
                                                            selected={f.value == stateChecklistValue}
                                                            onSelecionar={this.onSelecionar.bind(this)}
                                                        />
                                                    ))}
                                                </>
                                            );
                                        }}
                                    </QueryDb>
                                </>
                            )}
                        </ScrollView>
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <PaperButton onPress={this.cancelar.bind(this)}>Cancelar</PaperButton>
                        <PaperButton onPress={this.confirmar.bind(this)}>Confirmar</PaperButton>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        );
    }
}

export default ModalFiltro;
