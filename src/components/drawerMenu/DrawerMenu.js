import React from 'react';

import { StyleSheet } from 'react-native';

import { connect } from '@cerebral/react';
import { state, signal } from 'cerebral/tags';

import Drawer from 'react-native-drawer';

import Menu from './Menu';

const styles = StyleSheet.create({
    root: {
        elevation: 5,
    },
});

class DrawerMenu extends React.Component {
    onClose = () => {
        this.props.signalCloseMenu();
    };

    render() {
        const { menuOpen } = this.props;

        return (
            <Drawer
                key="drawer"
                content={<Menu />}
                open={menuOpen}
                tapToClose={true}
                openDrawerOffset={0.3}
                panCloseMask={0.3}
                tweenEasing="easeInOutQuad"
                onClose={this.onClose}
                tweenHandler={ratio => ({
                    main: { opacity: 1 }, //(2 - ratio) / 2
                    mainOverlay: { zIndex: 10, opacity: ratio / 2, backgroundColor: 'black' },
                })}
                style={styles.root}
            >
                {this.props.children}
            </Drawer>
        );
    }
}

export default connect(
    {
        menuOpen: state`app.menuOpen`,
        signalCloseMenu: signal`app.closeMenu`,
    },
    DrawerMenu
);
