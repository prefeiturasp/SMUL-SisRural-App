import React from 'react';

import { View, Linking, Dimensions } from 'react-native';

import PropTypes from 'prop-types';

import HTML from 'react-native-render-html';

import Theme from '../../Theme';

class HtmlText extends React.Component {
    static propTypes = {
        html: PropTypes.string,

        colorH: PropTypes.string,
        colorText: PropTypes.string,

        fontFamily: PropTypes.string,
        fontSize: PropTypes.number,

        flex: PropTypes.number,
    };

    static defaultProps = {
        fontFamily: Theme.fontFamily.fontRegular,
        fontSize: 14,
        colorText: Theme.colors.darkGrey,
        colorH: Theme.colors.darkGrey,
        flex: 1,
    };

    constructor(props) {
        super(props);

        this.state = {};

        this.renderers = {};

        const { fontSize, fontFamily, colorText, colorH } = this.props;

        this.tagStyles = {
            strong: {
                fontFamily: Theme.fontFamily.fontBold,
                fontSize,
                color: colorText,
            },
            a: {
                fontFamily,
                fontSize,
                color: colorText,
            },
            h1: {
                fontFamily: Theme.fontFamily.fontSemiBold,
                fontWeight: 'normal',
                fontSize,
                color: colorH,
                letterSpacing: 2.5,
            },
            h2: {
                fontFamily: Theme.fontFamily.fontSemiBold,
                fontWeight: 'normal',
                fontSize,
                color: colorH,
                letterSpacing: 2.5,
            },
            p: {
                fontFamily: fontFamily,
                fontSize,
                color: colorText,
                marginVertical: 10,
            },
            ol: {
                paddingLeft: 0,
            },
            ul: {
                paddingLeft: 0,
            },
        };
    }

    onLinkPress = (evt, link) => {
        Linking.canOpenURL(link).then(() => {
            Linking.openURL(link);
        });
    };

    render() {
        const { html, fontSize, fontFamily, colorText, flex } = this.props;

        return (
            <View style={{ flex }}>
                <HTML
                    html={html}
                    tagsStyles={this.tagStyles}
                    baseFontStyle={{
                        fontFamily,
                        color: colorText,
                        fontSize,
                    }}
                    emSize={fontSize}
                    onLinkPress={this.onLinkPress}
                    renderers={this.renderers}
                    imagesMaxWidth={Dimensions.get('window').width}
                />
            </View>
        );
    }
}

export default HtmlText;
