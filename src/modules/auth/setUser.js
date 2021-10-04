import crashlytics from '@react-native-firebase/crashlytics';
import jwtDecode from 'jwt-decode';
import { get } from 'lodash';
import store from 'react-native-simple-store';
import { letters } from '../../utils/StringUtil';

export default function({ props, state, http }) {
    const result = get(props, 'response.result');

    if (result && result.access_token && !result.error) {
        const token = result.access_token;

        store.save('token', token);
        state.set('auth.token', token);

        let decodeToken = jwtDecode(token);

        let user = decodeToken.user;
        if (user) {
            crashlytics().setUserId(user.id + '');
            crashlytics().setAttributes({
                full_name: user.first_name + ' ' + user.last_name,
            });

            user.full_name = user.first_name + ' ' + user.last_name;
            user.letters = letters(user.first_name + ' ' + user.last_name);
            user.dominio = decodeToken['user.dominio'];
            user.role = decodeToken['user.role'];
            state.set('auth.user', user);
        }

        // global.STORAGE_KEY = state.get('auth.user.id'); //storage geral do sistema

        http.updateOptions({
            headers: {
                Authorization: 'Bearer ' + token,
            },
        });
    }
}
