import PropTypes from 'prop-types';
import React from 'react';
import { TextInput, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Spacer, Touchable } from '../';
import Theme from '../../Theme';
import styles from './TextInputSearch.styles';

class TextInputSearch extends React.Component {
    static defaultProps = {};

    static propTypes = {
        // ...TextInputProps,
        onRef: PropTypes.func,
    };

    constructor(props) {
        super(props);
    }

    onIconPress = () => {
        this.input.focus();
    };

    onRef = elem => {
        this.input = elem;

        if (this.props.onRef) {
            this.props.onRef(elem);
        }
    };
    render() {
        return (
            <View style={styles.root}>
                <Spacer horizontal={2}>
                    <Touchable onPress={this.onIconPress}>
                        <MaterialIcons name="search" size={20} color={Theme.colors.coolGrey} />
                    </Touchable>
                </Spacer>

                <TextInput
                    accessibilityLabel={this.props.placeholder}
                    accessibilityRole="search"
                    ref={this.onRef}
                    style={styles.textinput}
                    placeholderTextColor={Theme.colors.coolGrey}
                    {...this.props}
                />
            </View>
        );
    }
}

export default TextInputSearch;
