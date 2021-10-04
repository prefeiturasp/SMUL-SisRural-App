import { Form } from '@cerebral/forms/lib/form';
import _ from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import uuid from 'react-native-uuid';

const promiseMap = new Map();

export function isValidForms(list) {
    if (!list || list.length === 0) {
        return false;
    }

    const listIsValid = list.filter(form => {
        return isValidForm(form);
    });

    return listIsValid.length === list.length;
}

export function isValidForm(form) {
    return new Form(form).isValid;
}

export function deleteFromList(path, pathDelete, position, data, state, isSetPathDelete = true) {
    if (data.id && isSetPathDelete) {
        const list = state.get(pathDelete);
        list.push(data.id);

        state.set(pathDelete, list);
    }

    state.set(path, state.get(path).filter((v, k) => k !== position));
}

export function setFormData(path, data, state) {
    let form = cloneDeep(state.get(path));

    Object.keys(form).map(v => {
        form[v].value = data[v] != null && data[v] !== undefined ? data[v] : '';
    });

    state.set(path, form);
}

export function populateForm(form, data) {
    return Object.keys(form).reduce((next, key) => {
        const defaultValue = form[key].defaultValue === undefined ? null : form[key].defaultValue;
        next[key] = {
            defaultValue,
            value: data[key] || defaultValue,
        };
        return next;
    }, {});
}

// CUIDADO: o signal do cerebral que você deseja controlar a execução para buscar ou retorno ou identificar o fim da execução,
//          não pode ter em sua árvore algum signal do module, caso contrário, o completeHandler será injetado não somente no final
//          da execução. Ver o PlanoAcaoModule no signal resetPlanoAcao que faz parte do signal fetchPlanoAcao. Para que o controle
//          do término do signal fetchPlanoAcao seja realizado com sucesso, o resetPlanoAcao precisou ser encapsulado em um outro array.
export function makePromise() {
    const promiseData = { promise: null, resolve: null, reject: null, id: uuid.v1() };

    promiseData.promise = new Promise((resolve, reject) => {
        promiseData.resolve = resolve;
        promiseData.reject = reject;
    });

    promiseMap.set(promiseData.id, promiseData);

    return promiseData;
}

function getPromise(promiseId) {
    if (!promiseMap.has(promiseId)) {
        throw new Error('Promise not found ' + promiseId);
    }
    return promiseMap.get(promiseId);
}

class OnCompleteError extends Error {
    data = null;
    originalError = null;

    constructor(err, data) {
        super(err.message);
        this.data = data;
        this.originalError = err;
    }
}

export function rejectPromise(promiseId, err) {
    const promiseData = getPromise(promiseId);
    promiseData.reject(err);
}

export function resolvePromise(promiseId, ...args) {
    const promiseData = getPromise(promiseId);
    promiseData.resolve(...args);
}

export const onCompleteErrorHandler = ({ props }) => {
    const { onComplete, ...rest } = props;
    if (onComplete) {
        rejectPromise(onComplete, new OnCompleteError(rest.error, rest));
    }
};

export const onCompleteHandler = ({ props }) => {
    const { onComplete, ...rest } = props;
    if (onComplete) {
        resolvePromise(onComplete, rest);
    }
};

export function decorateModuleSignals(module, fn) {
    _.forEach(module.signals, signalDef => {
        signalDef.signal.push(fn);
    });

    _.forEach(module.modules, childModule => {
        decorateModuleSignals(childModule, fn);
    });
}

export function decorateModuleCatch(module, fn) {
    _.forEach(module.catch, catchArr => {
        catchArr[1].push(fn);
    });

    _.forEach(module.modules, childModule => {
        decorateModuleCatch(childModule, fn);
    });
}
