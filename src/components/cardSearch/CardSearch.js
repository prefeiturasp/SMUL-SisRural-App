import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { SmartIcon, Spacer, Text, Touchable, ViewSmart } from '../';
import styles from './CardSearch.styles';

class CardSearch extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string,
        subtitle: PropTypes.any,
        onPress: PropTypes.func,
        label: PropTypes.string,
        icon: PropTypes.string,

        disabled: PropTypes.bool,
    };

    static defaultProps = {
        icon: 'materialcommunityicons@clipboard-outline',
    };

    render() {
        const { title, subtitle, onPress, disabled, icon, label } = this.props;

        return (
            <Touchable
                accessibilityLabel={label || title}
                disabled={disabled}
                style={[styles.root, disabled ? styles.rootDisabled : null]}
                onPress={onPress}
            >
                <ViewSmart row alignEnd>
                    <View style={styles.icon}>
                        <SmartIcon icon={icon} size={24} color={'#FFF'} />
                    </View>

                    {!!subtitle && (
                        <React.Fragment>
                            <Spacer />

                            <Text white fontBold size12>
                                {subtitle}
                            </Text>
                        </React.Fragment>
                    )}
                </ViewSmart>

                <ViewSmart flex1 />

                <Text white fontMedium size16>
                    {title}
                </Text>
            </Touchable>
        );
    }
}

export default CardSearch;
