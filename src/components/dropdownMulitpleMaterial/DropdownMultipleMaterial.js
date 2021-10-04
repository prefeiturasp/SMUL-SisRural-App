import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Chip, Selectize } from 'react-native-material-selectize';
import { Text, Touchable } from '../';
import Theme from '../../Theme';
import styles from './DropdownMultipleMaterial.styles';

class DropdownMultipleMaterial extends React.Component {
    static defaultProps = {
        disabled: false,
        loading: false,
    };

    static propTypes = {
        label: PropTypes.string,

        data: PropTypes.arrayOf(
            PropTypes.shape({
                value: PropTypes.any,
                label: PropTypes.any,
            })
        ),
        value: PropTypes.any, //Value array de ids por causa do ComponentArrayConnect

        disabled: PropTypes.bool,
        loading: PropTypes.bool,
    };

    constructor(props) {
        super(props);
    }

    //Bug Componente <Selective/>
    //Force Update -> State -> Selective
    //Ex: Acessa tela com dois valores no Dropdown, vai para uma tela sem nenhum (os valores permanecem) ... não existe "componentWillReceiveProps" no componente. Não atualiza as infos presentes na tela.
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (!isEqual(this.props.value, nextProps.value) && this._elem) {
            if (nextProps.data) {
                const selectize = this._elem;
                const itemId = selectize.props.itemId;
                const items = selectize._getNormalized({ itemId }, nextProps.data);
                const selectedItems = selectize._getNormalized(
                    { itemId },
                    this.getSelectedItemsFromValues(nextProps.value)
                );
                selectize.setState({ items, selectedItems });
            }
        }
    }

    renderRow = (id, onPress, item, style) => {
        const { disabled } = this.props;

        return (
            <Touchable
                disabled={disabled}
                activeOpacity={0.6}
                key={id}
                onPress={onPress}
                style={[styles.listRow, style, disabled ? { opacity: 0.6 } : null]}
            >
                <Text size16>{item.label}</Text>
            </Touchable>
        );
    };

    renderChip = (id, onClose, item, style, iconStyle) => {
        if (item.value === undefined) {
            return null;
        }

        const { disabled } = this.props;

        if (disabled) {
            onClose = () => {};
            style = { ...style, opacity: 0.6 };
        }

        return <Chip key={id} iconStyle={iconStyle} onClose={onClose} text={item.label} style={style} />;
    };

    onChangeSelectedItems = selectedItems => {
        const items = selectedItems.entities.item;

        const values = Object.keys(items)
            .map(v => {
                return items[v].value;
            })
            .filter(v => v !== undefined);

        this.props.onChangeText(values);
    };

    getSelectedItemsFromValues = value => {
        const { data } = this.props;

        return data.filter(v => value && value.indexOf(v.value) > -1);
    };

    onBlur = () => {
        this._elem.submit();
    };

    render() {
        const { label, data, disabled, loading } = this.props;

        const customLabel = <Text size14>{label}</Text>;

        return (
            <View>
                {loading && <ActivityIndicator size="small" style={styles.loading} />}

                <Selectize
                    ref={elem => (this._elem = elem)}
                    itemId={'label'}
                    items={data}
                    baseColor={Theme.colors.coolGrey}
                    tintColor={Theme.colors.teal}
                    listStyle={styles.listStyle}
                    listRowStyle={styles.listRowStyle}
                    renderRow={this.renderRow}
                    renderChip={this.renderChip}
                    onChangeSelectedItems={this.onChangeSelectedItems}
                    selectedItems={this.getSelectedItemsFromValues(this.props.value)}
                    textInputProps={{ onBlur: this.onBlur, editable: !disabled }}
                    {...this.props}
                    label={customLabel}
                />
            </View>
        );
    }
}

export default DropdownMultipleMaterial;
