import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { Spacer, Text } from '../';
import styles from './CardTitle.styles';

class CardTitle extends React.PureComponent {
    static defaultProps = {
        flex1: false,
    };

    static propTypes = {
        title: PropTypes.string,
        flex1: PropTypes.bool,
        noBackground: PropTypes.bool,
    };

    render() {
        const { title, flex1, noBackground } = this.props;

        return (
            <View style={[styles.root, noBackground ? styles.rootNoBackground : null, flex1 ? styles.flex1 : null]}>
                {!!title && (
                    <Spacer horizontal={4} top={4} bottom={0}>
                        <Text size12 fontBold greyBlue>
                            {title}
                        </Text>

                        <Spacer />
                    </Spacer>
                )}

                {this.props.children}
            </View>
        );
    }
}

export default CardTitle;
