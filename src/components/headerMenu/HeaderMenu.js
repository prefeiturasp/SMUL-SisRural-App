import { connect } from '@cerebral/react';
import { signal } from 'cerebral/tags';
import PropTypes from 'prop-types';
import React from 'react';
import { Image, View } from 'react-native';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import { Text, Touchable } from '../';
import Theme from '../../Theme';
import styles from './HeaderMenu.styles';

class HeaderMenu extends React.Component {
    static defaultProps = {
        showLogo: false,
        onRefresh: null,
    };

    static propTypes = {
        title: PropTypes.string,
        showLogo: PropTypes.bool,
        onRefresh: PropTypes.func,
    };

    onMenuPress = () => {
        this.props.signalOpenMenu();
    };

    onRefreshPress = () => {
        this.props.onRefresh();
    };

    render() {
        const { title, showLogo, onRefresh } = this.props;

        return (
            <View style={styles.root}>
                <Touchable onPress={this.onMenuPress} style={styles.btnMenu}>
                    <IconMaterial name="menu" color={Theme.colors.darkGrey} size={28} />
                </Touchable>

                <View style={styles.title}>
                    {!!title && !showLogo && (
                        <Text size18 darkGrey alignCenter>
                            {title}
                        </Text>
                    )}

                    {!!showLogo && <Image resizeMode="contain" style={styles.logo} source={require('./logo.png')} />}
                </View>

                {onRefresh && (
                    <Touchable onPress={this.onRefreshPress} style={styles.btnSync}>
                        <IconMaterial name="sync" color={Theme.colors.darkGrey} size={28} />
                        {/* <IconMaterial name="sync-problem" color={Theme.colors.darkGrey} size={28} /> */}
                    </Touchable>
                )}
            </View>
        );
    }
}

export default connect(
    {
        signalOpenMenu: signal`app.openMenu`,
    },
    HeaderMenu
);
