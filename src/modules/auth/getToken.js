import store from 'react-native-simple-store';

export default function({ props, path }) {
    return store.get('token').then(value => {
        if (!value) {
            value = null;
        }

        props.storedToken = value;
    });
}
