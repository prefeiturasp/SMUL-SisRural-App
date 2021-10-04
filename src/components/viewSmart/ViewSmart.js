import { bool } from 'prop-types';
import React from 'react';
import { View } from 'react-native';

export default class ViewSmart extends React.Component {
    static propTypes = {
        flex1: bool,
        row: bool,

        spaceBetween: bool,
        spaceAround: bool,

        alignCenter: bool,
        alignEnd: bool,

        justifyCenter: bool,

        flexWrap: bool,

        zIndex0: bool,
    };

    render() {
        const {
            flex1,
            row,
            spaceBetween,
            spaceAround,
            alignCenter,
            flexWrap,
            zIndex0,
            justifyCenter,
            alignEnd,
            ...rest
        } = this.props;

        const styles = [];

        if (flex1) {
            styles.push({ flex: 1 });
        }

        if (row) {
            styles.push({ flexDirection: 'row' });
        }

        if (spaceBetween) {
            styles.push({ justifyContent: 'space-between' });
        }

        if (spaceAround) {
            styles.push({ justifyContent: 'space-around' });
        }

        if (alignCenter) {
            styles.push({ alignItems: 'center' });
        }

        if (alignEnd) {
            styles.push({ alignItems: 'flex-end' });
        }

        if (justifyCenter) {
            styles.push({ justifyContent: 'center' });
        }

        if (flexWrap) {
            styles.push({ flexWrap: 'wrap' });
        }

        if (zIndex0) {
            styles.push({ zIndex: 1, elevation: 0 });
        }

        return (
            <View {...rest} style={styles}>
                {this.props.children}
            </View>
        );
    }
}
