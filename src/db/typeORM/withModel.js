import hoistNonReactStatics from 'hoist-non-react-statics';
import React from 'react';

export default function withData(func, propName = 'data') {
    return WrappedComponent => {
        class WithDataWrapper extends React.Component {
            state = { data: undefined };
            async componentDidMount() {
                return this.loadData();
            }

            loadData = async () => {
                const data = await func(this.props);
                // eslint-disable-next-line react/no-did-mount-set-state

                this.setState({ data });
            };

            render() {
                if (this.state.data === undefined) {
                    return null;
                }

                const customProps = {};
                customProps[propName] = this.state.data;
                customProps[propName + 'Refresh'] = this.loadData;

                return <WrappedComponent {...this.props} {...customProps} />;
            }
        }
        return hoistNonReactStatics(WithDataWrapper, WrappedComponent);
    };
}
