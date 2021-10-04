import React from 'react';
import { Text, View } from 'react-native';
import styles from './DetachedTabBar.styles';

export default class DetachedTabBar extends React.Component {
    static defaultProps = {
        focused: true,
    };

    render() {
        return (
            <View style={[styles.Tab]}>
                <View style={styles.TabWrapper}>
                    <View style={styles.TextWrap}>
                        <Text style={[styles.TabLabel]}>{this.props.children}</Text>
                        <View style={[styles.TabIndicator]}></View>
                    </View>
                </View>
            </View>
        );
    }
}
