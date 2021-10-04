import PropTypes from 'prop-types';
import React from 'react';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconImage from '../iconImage/IconImage';

export class SmartIcon extends React.Component {
    static propTypes = {
        icon: PropTypes.string.isRequired,
    };

    getIconComponent = () => {
        const value = this.props.icon.split('@');

        if (value.length !== 2) {
            throw Error('Invalid icon');
        }

        let component = null;

        switch (value[0]) {
            case 'evilicons':
                component = EvilIcons;
                break;
            case 'materialicons':
                component = MaterialIcons;
                break;
            case 'materialcommunityicons':
                component = MaterialCommunityIcons;
                break;
            case 'fontawesome':
                component = FontAwesome;
                break;
            case 'iconimage':
                component = IconImage;
                break;
            default:
                component = MaterialCommunityIcons;
                break;
        }

        return { name: value[1], component };
    };

    render() {
        const IconComponent = this.getIconComponent();

        return <IconComponent.component name={IconComponent.name} {...this.props} />;
    }
}

export default SmartIcon;
