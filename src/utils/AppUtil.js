import { Linking } from 'react-native';
import { ENV } from 'react-native-dotenv';

export function isDev() {
    return ENV === 'dev';
}

export function openUrl(url) {
    if (url) {
        Linking.canOpenURL(url)
            .then(() => {
                Linking.openURL(url);
            })
            .catch((e) => {
                console.log('openUrl', e);
            });
    }
}

export function isImage(filename) {
    const v = filename.toLowerCase();
    return v.indexOf('.jpg') > -1 || v.indexOf('.png') > -1 || v.indexOf('.jpeg') > -1 || v.indexOf('.gif') > -1;
}

// export function isNotAuthenticated() {
//     const user = Controller.getState('auth.user');
//     return !user;
// }
