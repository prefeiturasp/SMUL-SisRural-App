import hoistNonReactStatics from 'hoist-non-react-statics';
import isFunction from 'lodash/isFunction';
import React from 'react';
import { QueryDb } from '../components';

export default function withDb(query, params, prop, returnFirst = false) {
    return WrappedComponent => {
        class WithDbWrapper extends React.Component {
            render() {
                const resolveParams = params.map(v => {
                    if (isFunction(v)) {
                        return v(this.props);
                    } else {
                        return v;
                    }
                });

                const queryExec = isFunction(query) ? query(this.props) : query;

                return (
                    <QueryDb returnFirst={returnFirst} query={queryExec} params={resolveParams}>
                        {data => {
                            let customProps = {};
                            customProps[prop] = data;

                            return <WrappedComponent {...customProps} {...this.props} />;
                        }}
                    </QueryDb>
                );
            }
        }

        return hoistNonReactStatics(WithDbWrapper, WrappedComponent);
    };
}
