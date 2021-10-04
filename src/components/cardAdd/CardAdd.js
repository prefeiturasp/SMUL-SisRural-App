import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { SmartIcon, Spacer, Text, Touchable, ViewSmart } from '../';
import Theme from '../../Theme';
import styles from './CardAdd.styles';

class CardAdd extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string,
        subtitle: PropTypes.any,
        onPress: PropTypes.func,

        icon: PropTypes.string,

        disabled: PropTypes.bool,
    };

    static defaultProps = {
        icon: 'materialcommunityicons@plus',
    };

    render() {
        const { title, subtitle, onPress, disabled, icon } = this.props;

        return (
            <Touchable
                disabled={disabled}
                style={[styles.root, disabled ? styles.rootDisabled : null]}
                onPress={onPress}
            >
                <ViewSmart row alignEnd>
                    <View style={styles.icon}>
                        <SmartIcon icon={icon} size={24} color={Theme.colors.teal} />
                    </View>

                    <Spacer />

                    <Text teal fontBold size12>
                        {subtitle}
                    </Text>
                </ViewSmart>

                <ViewSmart flex1 />

                <Text teal fontMedium size16>
                    {title}
                </Text>
            </Touchable>
        );
    }
}

export default CardAdd;
