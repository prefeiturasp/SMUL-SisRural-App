import React from 'react';

import PropTypes from 'prop-types';

import { View } from 'react-native';

import { Touchable, Text, Spacer, ViewSmart } from '../';

import MaterialIcons from 'react-native-vector-icons/AntDesign';

import Theme from '../../Theme';

import styles from './FooterSeeAll.styles';

class FooterSeeAll extends React.PureComponent {
    static defaultProps = {
        label: 'Ver Todos',
    };

    static propTypes = {
        label: PropTypes.string,
        onPress: PropTypes.func,
    };

    render() {
        const { label, onPress } = this.props;

        return (
            <React.Fragment>
                <View style={styles.hr} />

                <View style={styles.footer}>
                    <Touchable onPress={onPress}>
                        <ViewSmart row alignCenter justifyCenter>
                            <Text waterBlue size14 fontMedium>
                                {label}
                            </Text>

                            <Spacer horizontal={0.5} />

                            <MaterialIcons name="caretright" size={12} color={Theme.colors.waterBlue} />
                        </ViewSmart>
                    </Touchable>
                </View>
            </React.Fragment>
        );
    }
}

export default FooterSeeAll;
