import { Module } from 'cerebral';
import { set } from 'cerebral/operators';
import { state } from 'cerebral/tags';
import RNDisableBatteryOptimizationsAndroid from 'react-native-disable-battery-optimizations-android';
import { flowInitAuthUser } from './AuthModule';
import { createSyncFlow } from './DBModule';
import { offlineCheckFlow } from './OfflineModule';

const syncFlow = createSyncFlow(false, true, true, true, false, false, true, true);

export default Module({
    state: {
        logged: false,
        menuOpen: false,
    },
    signals: {
        initApp: [
            () => {
                RNDisableBatteryOptimizationsAndroid.isBatteryOptimizationEnabled().then((isEnabled) => {
                    if (isEnabled) {
                        RNDisableBatteryOptimizationsAndroid.enableBackgroundServicesDialogue();
                        //RNDisableBatteryOptimizationsAndroid.openBatteryModal();
                    }
                });
            },
            ...offlineCheckFlow,
            ...flowInitAuthUser,
        ],
        sync: [syncFlow],
        openMenu: [set(state`app.menuOpen`, true)],
        closeMenu: [set(state`app.menuOpen`, false)],
    },
});
