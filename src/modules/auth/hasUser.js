export default function hasUser({ state, path }) {
    if (state.get('auth.user')) {
        return path.true();
    } else {
        return path.false();
    }
}
