import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { matchRoutes } from 'react-router-config';
import { withRouter } from 'react-router-native';
import { ActionRoute, Spacer, Text, Touchable, ViewSmart } from '../';
import Theme from '../../Theme';
import { formatCpf } from '../../utils/StringUtil';
import QueryDb from '../queryDb/QueryDb';
import SmartIcon from '../smartIcon/SmartIcon';
import styles from './Menu.styles';

class Menu extends React.Component {
    onButtonMenuPress = (route) => {
        this.props.signalCloseMenu();

        const _history = ActionRoute.getHistory();

        const { entries } = _history;
        const newEntries = entries.filter(e => e.pathname == '/home');

        if (newEntries.length > 0) {
            _history.entries = [];
            _history.index = 0;
            _history.length = 0;

            ActionRoute.replace('/home');
        } else {
            ActionRoute.go('/home');
        }

        if (route != '/home') {
            ActionRoute.go(route);
        }
    };

    isSelected = (path) => {
        const foundRoute = matchRoutes(
            [
                {
                    path,
                    exact: true,
                },
            ],
            this.props.location.pathname
        );

        return foundRoute.length > 0;
    };

    onSyncPress = () => {
        this.props.signalCloseMenu();
        this.props.signalSync({ force: true });
    };

    onLogoutPress = () => {
        this.props.signalCloseMenu();
        this.props.signalLogout();
    };

    onStatusPress = () => {
        this.props.signalOfflineCheck();
    };

    render() {
        const { user, logged } = this.props;

        return (
            <View style={styles.root}>
                {!!user && (
                    <ViewSmart row alignCenter>
                        <Avatar.Text
                            size={58}
                            label={user.letters}
                            style={styles.avatar}
                            labelStyle={styles.avatarLabel}
                        />

                        <Spacer />

                        <ViewSmart flex1>
                            <Text charcoal size16>
                                {user.full_name}
                            </Text>

                            <Text coolGrey size14>
                                CPF: {formatCpf(user.document)}
                            </Text>

                            <Spacer vertical={0.5} />

                            {user.dominio && (
                                <Text size12 coolGrey>
                                    Domínio: {user.dominio.nome}
                                </Text>
                            )}

                            {user.role && (
                                <Text size12 coolGrey>
                                    Papel: {user.role.name}
                                </Text>
                            )}

                            <Spacer vertical={0.5} />

                            <TouchableWithoutFeedback onPress={this.onStatusPress}>
                                <ViewSmart row alignCenter>
                                    <Text size10 coolGrey>
                                        Status:{' '}
                                    </Text>

                                    {this.props.isOnline && (
                                        <Text size10 teal>
                                            ON-LINE
                                        </Text>
                                    )}

                                    {!this.props.isOnline && (
                                        <Text size10 red>
                                            OFFLINE
                                        </Text>
                                    )}
                                </ViewSmart>
                            </TouchableWithoutFeedback>
                        </ViewSmart>
                    </ViewSmart>
                )}

                <Spacer vertical={4}>
                    <View style={styles.Hr} />
                </Spacer>

                <ScrollView contentContainerStyle={styles.scrollviewContent}>
                    <ButtonMenu
                        title="Tela Inicial"
                        icon="materialcommunityicons@view-dashboard-outline"
                        selected={this.isSelected('/home')}
                        onPress={this.onButtonMenuPress.bind(this, '/home')}
                    />

                    {logged && user && user.id && (
                        <QueryDb
                            query={
                                'select count(unidade_produtivas.id) as total from unidade_produtivas where owner_id = :owner_id and fl_fora_da_abrangencia_app = 1'
                            }
                            params={[user.id]}
                            supressError
                        >
                            {(data) => {
                                if (data.length > 0 && data[0].total > 0) {
                                    return (
                                        <ButtonMenu
                                            title={`Unidades Produtivas\nFora da Abrangência`}
                                            icon="materialcommunityicons@alert"
                                            selected={this.isSelected('/buscaUnidadeProdutivaInvalidas')}
                                            onPress={this.onButtonMenuPress.bind(
                                                this,
                                                '/buscaUnidadeProdutivaInvalidas'
                                            )}
                                        />
                                    );
                                } else {
                                    return null;
                                }
                            }}
                        </QueryDb>
                    )}

                    <ButtonMenu
                        title="Produtores"
                        icon="iconimage@produtor"
                        selected={this.isSelected('/buscaProdutor')}
                        onPress={this.onButtonMenuPress.bind(this, '/buscaProdutor')}
                    />

                    <ButtonMenu
                        title="Cadernos de Campo"
                        icon="iconimage@caderno"
                        selected={this.isSelected('/buscaCadernoCampo')}
                        onPress={this.onButtonMenuPress.bind(this, '/buscaCadernoCampo')}
                    />

                    <ButtonMenu
                        title="Formulários"
                        icon="iconimage@caderno"
                        selected={this.isSelected('/buscaChecklist')}
                        onPress={this.onButtonMenuPress.bind(this, '/buscaChecklist')}
                    />

                    <ButtonMenu
                        title="Planos de Ação"
                        icon="iconimage@planoAcao"
                        selected={this.isSelected('/buscaPlanoAcao/individual')}
                        onPress={this.onButtonMenuPress.bind(this, '/buscaPlanoAcao/individual')}
                    />

                    <ButtonMenu
                        title="Planos de Ação Coletivo"
                        icon="iconimage@planoAcao"
                        selected={this.isSelected('/buscaPlanoAcao/coletivo')}
                        onPress={this.onButtonMenuPress.bind(this, '/buscaPlanoAcao/coletivo')}
                    />

                    <ButtonMenu
                        title="Fale Conosco"
                        icon="materialcommunityicons@help-circle-outline"
                        selected={this.isSelected('/faleConosco')}
                        onPress={this.onButtonMenuPress.bind(this, '/faleConosco')}
                    />

                    <ButtonMenu
                        title="Sincronizar Dados"
                        icon="materialcommunityicons@sync"
                        onPress={this.onSyncPress}
                    />

                    <ButtonMenu title="Sair" icon="materialcommunityicons@exit-to-app" onPress={this.onLogoutPress} />
                </ScrollView>
            </View>
        );
    }
}

const ButtonMenu = (props) => {
    const { selected } = props;

    return (
        <Touchable
            style={[styles.ButtonMenu, selected ? styles.ButtonMenu__rootSelected : null]}
            onPress={props.onPress}
        >
            {selected && <View style={styles.ButtonMenu__selected} />}

            <SmartIcon icon={props.icon} color={Theme.colors.greyBlue} size={18} />

            <Spacer />

            <Text darkGrey={selected} greyBlue={!selected} size16>
                {props.title}
            </Text>
        </Touchable>
    );
};
ButtonMenu.propTypes = {
    title: PropTypes.string,
    route: PropTypes.string,
    icon: PropTypes.string,

    selected: PropTypes.bool,
};

export default connect(
    {
        user: state`auth.user`,
        logged: state`app.logged`,

        signalCloseMenu: signal`app.closeMenu`,
        signalLogout: signal`auth.logout`,
        signalSync: signal`db.forceSync`,
        isOnline: state`offline.isOnline`,
        signalOfflineCheck: signal`offline.offlineCheck`,
        signalFooBar: signal`app.foobar`,
    },
    withRouter(Menu)
);
