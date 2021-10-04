let _history;

export function goN(n) {
    _history.go(n);
}

export function go(page, state) {
    _history.push(page, state ? state : {});
}

export function replace(page, state) {
    _history.replace(page, state ? state : {});
}

export function back() {
    if (_history.length > 0) {
        _history.goBack();
    }
}

export function isBack() {
    return _history.length > 1;
}

export function reset() {
    const { location } = _history;

    _history.entries = [location];
    _history.index = 0;
    _history.length = 1;
}
export function setHistory(history) {
    _history = history;
}

export function getHistory() {
    return _history;
}

export default {
    go: go,
    goN: goN,
    replace: replace,
    back: back,
    reset: reset,

    setHistory: setHistory,
    getHistory: getHistory,
};
