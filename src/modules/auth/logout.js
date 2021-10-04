import store from 'react-native-simple-store';
import { ActionRoute } from '../../components';

export default async function({ state, http }) {
    ActionRoute.replace('/login');

    await state.set('auth.token', null);
    await state.set('auth.user', null);
    await state.set('db.lastSync', 0);

    await state.set('app.logged', false);

    await store.delete('token');

    http.updateOptions({
        headers: {},
    });
}
