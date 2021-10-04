export default function existStoredToken({ props, path }) {
    if (props.storedToken) {
        return path.success();
    } else {
        return path.error();
    }
}
