import { BASE_URL, ENDPOINT } from 'react-native-dotenv';

import { CellScanModule } from '@fbcmobile/signalscan';
import HttpProvider from '@cerebral/http';
import { PermissionsAndroid } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

console.log("a2", BASE_URL);

export default HttpProvider({
    baseUrl: `${BASE_URL}${ENDPOINT}`,

    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
        Accept: 'application/json',
    },

    withCredentials: false,

    timeout: 5000,

    onError: (error)=> {
        try {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE)
                .then((granted) => granted && PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION))
                .then((granted) => {
                    if (granted) {
                        return CellScanModule.getCellScanResults();
                    } else {
                        return null;
                    }
                })
                .then((result) => {
                    if (result) {
                        crashlytics().log('CELULAR:' + JSON.stringify(result));
                    }
                }).finally(()=> {
                    crashlytics().recordError(error);
                });
        } catch (e) {}
    }
});
