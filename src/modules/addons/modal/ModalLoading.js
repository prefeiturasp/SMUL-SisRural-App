import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Spacer, Text } from '../../../components';
import styles from './ModalLoading.styles';

export default class ModalLoading extends React.Component {
    static propTypes = {
        visible: PropTypes.any,
        info: PropTypes.any,
    };

    render() {
        return (
            <Animatable.View
                accessibilityViewIsModal={this.props.visible}
                accessibilityState={{ busy: this.props.visible }}
                duration={300}
                animation={this.props.visible ? 'fadeIn' : 'fadeOut'}
                pointerEvents={this.props.visible ? 'auto' : 'none'}
                style={[styles.root]}
            >
                <View style={styles.content}>
                    <ActivityIndicator style={styles.indicator} size={32} color={'#FFF'} />

                    {this.props.title && (
                        <Spacer vertical={2} horizontal={2}>
                            <Text fontBold white>
                                {this.props.title}
                            </Text>
                        </Spacer>
                    )}
                </View>
            </Animatable.View>
        );
    }
}
