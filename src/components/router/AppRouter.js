import React from 'react';
import { Route, withRouter } from 'react-router-native';
import { setHistory } from './actionRoute/ActionRoute';
import BackPressExit from './backPressExit/BackPressExit';
const log = require('debug')('AppRouter');

class AppRouter extends React.Component {
    constructor(props) {
        super(props);
    }

    setup = () => {
        setHistory(this.props.history);
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        log('Router change', nextProps.location);
    }

    render() {
        return (
            <BackPressExit>
                <Route ref={this.setup}>{this.props.children}</Route>
            </BackPressExit>
        );
    }
}

export default withRouter(AppRouter);
