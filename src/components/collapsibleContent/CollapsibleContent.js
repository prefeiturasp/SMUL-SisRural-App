import PropTypes from 'prop-types';
import React from 'react';

import styles from './CollapsibleContent.styles';

import { Touchable, Spacer } from '../';

import Theme from '../../Theme';
import Collapsible from 'react-native-collapsible';
import SmartIcon from '../smartIcon/SmartIcon';
import Separator from '../separator/Separator';

class CollapsibleContent extends React.Component {
    static propTypes = {
        header: PropTypes.node.isRequired,
        icons: PropTypes.shape({
            collapsed: PropTypes.string,
            notCollapsed: PropTypes.string,
        }),
        children: PropTypes.node,
        disableCollapse: PropTypes.bool,
    };

    static defaultProps = {
        collapsed: true,
        disableCollapse: false,
        icons: {
            collapsed: 'materialicons@keyboard-arrow-down',
            notCollapsed: 'materialicons@keyboard-arrow-up',
        },
    };

    constructor(props) {
        super(props);
        this.state = { collapsed: props.collapsed };
    }

    onToggleCollapsed() {
        this.setState(prevState => ({ collapsed: !prevState.collapsed }));
    }

    render() {
        const { disableCollapse, icons } = this.props;
        const { collapsed } = this.state;
        const collapsibleIcon = collapsed ? icons.collapsed : icons.notCollapsed;

        return (
            <>
                <Touchable style={styles.header} onPress={this.onToggleCollapsed.bind(this)} disabled={disableCollapse}>
                    {this.props.header}
                    {!disableCollapse && <SmartIcon icon={collapsibleIcon} size={24} color={Theme.colors.slateGrey} />}
                </Touchable>
                <Separator />
                <Collapsible collapsed={collapsed}>
                    <Spacer vertical={2} />
                    {this.props.children}
                </Collapsible>
            </>
        );
    }
}

export default CollapsibleContent;
