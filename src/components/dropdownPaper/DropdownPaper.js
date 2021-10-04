import find from 'lodash/find';
import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import { TextInputPaper } from '..';
import Theme from '../../Theme';
import styles from './DropdownPaper.styles';

class DropdownPaper extends React.Component {
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

    renderBase = props => {
        const { value, data, label } = this.props;

        const item = find(data, v => v.value === value || v.label === v);

        const v = item ? item.label : value;

        return (
            <View>
                <TextInputPaper key={v} {...props} value={v} label={label} />

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

export default DropdownPaper;
