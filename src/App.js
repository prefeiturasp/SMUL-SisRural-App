import { Container } from '@cerebral/react';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NativeRouter, Route } from 'react-router-native';
import './App.setup';
import { DrawerMenu } from './components';
import { AppRouter } from './components/router';
import Controller from './controller/Controller';
import ModalContainer from './modules/addons/modal/ModalContainer';
import Routes from './Routes';
import Theme from './Theme';
import ThemePaper from './ThemePaper';
import {YellowBox} from 'react-native';

YellowBox.ignoreWarnings(['Debugger']);

export default class App extends React.Component {
    render() {
        return (
            <View style={styles.root}>
                <Container controller={Controller}>
                    <PaperProvider theme={ThemePaper}>
                        <NativeRouter>
                            <AppRouter>
                                <ModalContainer />
                                <DrawerMenu>
                                    <Route component={Routes} />
                                </DrawerMenu>
                            </AppRouter>
                        </NativeRouter>
                    </PaperProvider>
                </Container>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Theme.colors.whiteTwo,
    },
});
