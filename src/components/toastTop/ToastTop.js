import { connect } from '@cerebral/react';
import { signal } from 'cerebral/tags';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { IconImage, Spacer, Text, Touchable } from '../';
import styles from './ToastTop.styles';

class ToastTop extends React.Component {
    static defaultProps = {
        type: 'warning',
        visible: false,
    };

    static propTypes = {
        id: PropTypes.number,
        type: PropTypes.oneOf(['warning', 'info']),

        text: PropTypes.string,

        visible: PropTypes.bool.isRequired,

        onPress: PropTypes.any,

        signalRemoveToast: PropTypes.func,

        inside: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.state = {};
    }

    onPress = () => {
        const { id } = this.props;

        this.props.signalRemoveToast({ id });

        if (this.props.onPress) {
            this.props.onPress();
        }
    };

    render() {
        const { visible, type, text, inside } = this.props;

        const styleBg = type === 'warning' ? styles.warning : styles.info;

        return (
            <View style={styles.root}>
                <Touchable onPress={this.onPress}>
                    <Collapsible collapsed={!visible}>
                        <View style={[styleBg, styles.view, inside ? styles.viewInside : null]}>
                            <Text white size14 style={styles.text}>
                                {text}
                            </Text>

                            <Spacer>
                                <IconImage name={'closeWhite'} />
                            </Spacer>
                        </View>
                    </Collapsible>
                </Touchable>
            </View>
        );
    }
}

export default connect(
    {
        signalRemoveToast: signal`toast.removeToast`,
    },
    ToastTop
);
