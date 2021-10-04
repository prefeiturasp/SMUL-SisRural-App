import propTypes from 'prop-types';
import React from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { Button, Dialog, Paragraph } from 'react-native-paper';
import styles from './ModalComponent.styles';

export default class ModalComponent extends React.Component {
    static propTypes = {
        buttons: propTypes.array,
        onButtonClick: propTypes.func,
        title: propTypes.string,
        titleWithBorder: propTypes.bool,
        html: propTypes.string,
        theme: propTypes.string,
        onRequestClose: propTypes.func,
        contentStyle: propTypes.any,
        bounces: propTypes.bool,
    };

    static defaultProps = {
        onRequestClose: () => {},
    };

    renderButtons = buttons => {
        return buttons.map((data, i) => {
            return (
                <Button
                    onPress={() => {
                        this.props.onButtonClick(data);
                    }}
                    key={i}
                >
                    {data.label.toUpperCase()}
                </Button>
            );
        });
    };

    render() {
        const { title, buttons, onRequestClose, content } = this.props;

        return (
            <View accessibilityRole="alert" accessibilityViewIsModal={true} style={styles.root}>
                <Dialog dismissable={false} onDismiss={onRequestClose} visible={true}>
                    <Dialog.Title>{title}</Dialog.Title>
                    {content && (
                        <ScrollView
                            style={{
                                flexGrow: 0,
                                maxHeight: Dimensions.get('window').height - 180,
                            }}
                        >
                            <Dialog.Content>
                                <Paragraph>{content}</Paragraph>
                            </Dialog.Content>
                        </ScrollView>
                    )}

                    {buttons && buttons.length > 0 && <Dialog.Actions>{this.renderButtons(buttons)}</Dialog.Actions>}
                </Dialog>
            </View>
        );
    }
}
