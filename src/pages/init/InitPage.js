import { connect } from '@cerebral/react';
import { signal } from 'cerebral/tags';
import PropTypes from 'prop-types';
import React from 'react';
import { Image, View } from 'react-native';
import styles from './InitPage.styles';

class InitPage extends React.Component {
    static propTypes = {
        signalInitApp: PropTypes.any,
    };

    static contextTypes = {
        router: PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.signalInitApp();
    }

    render() {
        return (
            <View style={styles.root}>
                <View style={styles.content}>
                    <Image resizeMode="contain" style={styles.logo} source={require('./assets/logo.png')} />
                </View>
            </View>
        );
    }
}

export default connect(
    {
        signalInitApp: signal`app.initApp`,
    },
    InitPage
);
