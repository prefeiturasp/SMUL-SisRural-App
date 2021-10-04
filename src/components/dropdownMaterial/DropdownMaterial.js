import { ActivityIndicator, View } from 'react-native';

import { Dropdown } from 'react-native-material-dropdown';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import React from 'react';
import { TextInputMaterial } from '../';
import Theme from '../../Theme';
import find from 'lodash/find';
import styles from './DropdownMaterial.styles';

class DropdownMaterial extends React.Component {
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

        disabled: PropTypes.bool,
        loading: PropTypes.bool,
    };

    constructor(props) {
        super(props);
    }

    renderBase = (props) => {
        const { value, data, label } = this.props;

        const item = find(data, (v) => {
            return v.value === value || v.label === v || (value === '' && v.value === null);
        });

        const v = item ? item.label : value;

        return (
            <View>
                <TextInputMaterial key={v} {...props} value={v} label={label} />

                <IconMaterial name="arrow-drop-down" style={styles.arrow} color={Theme.colors.coolGrey} size={24} />
            </View>
        );
    };

    render() {
        const { loading } = this.props;

        return (
            <View>
                {loading && <ActivityIndicator size="small" style={styles.loading} />}

                <Dropdown
                    baseColor={Theme.colors.paleGrey}
                    // textColor={Theme.colors.gray90}
                    // itemTextStyle={{ fontFamily: Theme.fontFamily.fontRegular }}
                    renderBase={this.renderBase}
                    {...this.props}
                />
            </View>
        );
    }
}

export default DropdownMaterial;
