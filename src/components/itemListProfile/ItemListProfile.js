import PropTypes from 'prop-types';
import React from 'react';
import { Avatar } from 'react-native-paper';
import { Spacer, Text, Touchable, ViewSmart } from '../../components';
import styles from './ItemListProfile.styles';

class ItemListProfile extends React.PureComponent {
    static propTypes = {
        letters: PropTypes.string,

        text1: PropTypes.any,
        text2: PropTypes.any,
        text3: PropTypes.any,
        text4: PropTypes.any,

        onPress: PropTypes.func,
    };

    render() {
        const { letters, text1, text2, text3, text4, onPress } = this.props;

        return (
            <Touchable style={styles.content} onPress={onPress}>
                <Avatar.Text size={44} label={letters} style={styles.avatar} labelStyle={styles.avatarLabel} />

                <Spacer horizontal={1.5} />

                <ViewSmart flex1>
                    {!!text1 && (
                        <Text charcoal fontBold size16>
                            {text1}
                        </Text>
                    )}

                    {!!text2 && (
                        <Text teal size14>
                            {text2}
                        </Text>
                    )}

                    {!!text3 && (
                        <Text coolGreyLight size12>
                            {text3}
                        </Text>
                    )}

                    {!!text4 && (
                        <Text coolGreyLight size12>
                            {text4}
                        </Text>
                    )}
                </ViewSmart>
            </Touchable>
        );
    }
}

export default ItemListProfile;
