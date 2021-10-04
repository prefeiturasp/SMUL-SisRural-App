import PropTypes from 'prop-types';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Spacer, Text, Touchable } from '../';
import Theme from '../../Theme';
import styles from './BarTitleArrow.styles';

class BarTitleArrow extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        expanded: PropTypes.bool,
        onPress: PropTypes.func,
    };

    render() {
        const { title, expanded, onPress } = this.props;

        return (
            <Touchable onPress={onPress} style={styles.bar}>
                <Spacer vertical={2} horizontal={2}>
                    <Text teal>{title}</Text>
                </Spacer>

                <Spacer horizontal={2}>
                    <MaterialIcons
                        name={expanded ? 'arrow-drop-up' : 'arrow-drop-down'}
                        size={24}
                        color={Theme.colors.teal}
                    />
                </Spacer>
            </Touchable>
        );
    }
}

export default BarTitleArrow;
