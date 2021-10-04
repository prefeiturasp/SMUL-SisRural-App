import React from 'react';

import { ToastAndroid, BackHandler } from 'react-native';

import { ActionRoute } from '../';

class BackPressExit extends React.Component {
    constructor(props) {
        super(props);

        this.state = { backPress: false };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onHardwareBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onHardwareBackPress);
    }

    onHardwareBackPress = () => {
        const history = ActionRoute.getHistory();

        if (history.index > 0) {
            history.goBack();
            return true;
        }

        if (!this.state.backPress) {
            ToastAndroid.show('Clique novamente para sair.', ToastAndroid.SHORT);

            this.setState({ backPress: true });

            this.timeout = setTimeout(() => {
                this.setState({ backPress: false });
            }, 2500);
        } else {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            BackHandler.exitApp();
            return true;
        }

        return true;
    };

    render() {
        return this.props.children;
    }
}

export default BackPressExit;
