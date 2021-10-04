import React from 'react';

import { View, StyleSheet } from 'react-native';

import PropTypes from 'prop-types';

class Spacer extends React.PureComponent {
    static defaultProps = {
        marginHorizontal: 5,
        marginVertical: 5,
        horizontal: 1,
        vertical: 1,

        style: {},
    };

    static propTypes = {
        horizontal: PropTypes.number,
        vertical: PropTypes.number,

        left: PropTypes.number,
        right: PropTypes.number,
        top: PropTypes.number,
        bottom: PropTypes.number,

        marginHorizontal: PropTypes.number,
        marginVertical: PropTypes.number,

        style: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.any]),

        children: PropTypes.any,
    };

    render() {
        const { marginHorizontal, marginVertical, left, right, top, bottom, horizontal, vertical } = this.props;

        const defaultHorizontal = marginHorizontal * horizontal;
        const defaultVertical = marginVertical * vertical;

        let mr = defaultHorizontal;
        let ml = defaultHorizontal;

        let mb = defaultVertical;
        let mt = defaultVertical;

        if (left !== undefined) {
            ml = marginHorizontal * left;
        }
        if (right !== undefined) {
            mr = marginHorizontal * right;
        }
        if (top !== undefined) {
            mt = marginVertical * top;
        }
        if (bottom !== undefined) {
            mb = marginVertical * bottom;
        }

        return (
            <View
                style={[
                    {
                        marginTop: mt,
                        marginBottom: mb,
                        marginLeft: ml,
                        marginRight: mr,
                    },
                    StyleSheet.flatten(this.props.style),
                ]}
            >
                {this.props.children}
            </View>
        );
    }
}

export default Spacer;
