import React from 'react';

import PropTypes from 'prop-types';

import { Picker } from 'react-native';

import { ViewSmart, Text, Spacer } from '../';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import find from 'lodash/find';

import Theme from '../../Theme';

import styles from './DropdownFilter.styles';

class DropdownFilter extends React.Component {
    static defaultProps = {};

    static propTypes = {
        label: PropTypes.string,

        value: PropTypes.any,

        data: PropTypes.arrayOf(
            PropTypes.shape({
                value: PropTypes.any,
                label: PropTypes.any,
            })
        ),
    };

    constructor(props) {
        super(props);
    }

    getLabel = () => {
        const { value, data } = this.props;

        const item = find(data, v => v.value === value || v.label === v);

        return item ? item.label : this.props.label;
    };

    onValueChange = (itemValue, itemPosition) => {
        if (this.props.onChangeText) {
            this.props.onChangeText(itemValue);
        }
    };

    render() {
        return (
            <ViewSmart row alignCenter>
                <Text charcoal size14>
                    Filtrar por:
                </Text>

                <Spacer horizontal={0.5} />

                <ViewSmart row alignCenter>
                    <Text waterBlue size14 fontBold>
                        {this.getLabel()}
                    </Text>

                    <MaterialIcons name="arrow-drop-down" size={24} color={Theme.colors.waterBlue} />

                    <Picker style={styles.picker} selectedValue={this.props.value} onValueChange={this.onValueChange}>
                        {this.props.data.map(v => {
                            return <Picker.Item key={v.value} label={v.label} value={v.value} />;
                        })}
                    </Picker>
                </ViewSmart>
            </ViewSmart>
        );
    }
}

export default DropdownFilter;
