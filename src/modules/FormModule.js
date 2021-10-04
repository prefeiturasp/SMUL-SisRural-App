import { setField } from '@cerebral/forms/operators';
import { Module } from 'cerebral';
import { push, set, splice } from 'cerebral/operators';
import { props as Props, state as State } from 'cerebral/tags';
import findIndex from 'lodash/findIndex';
import resetFormCustom from './form/resetFormCustom';
import { APIResponse } from './services';

export default Module({
    state: {},

    signals: {
        test: [set(State`test`, 'bar')],
        setField: [setField(State`${Props`path`}`, Props`value`), set(State`${Props`path`}.focus`, true)],

        untouchedField: [set(State`${Props`path`}.touched`, false)],
        touchedField: [set(State`${Props`path`}.touched`, true), set(State`${Props`path`}.focus`, false)],
        focusField: [set(State`${Props`path`}.focus`, true)],

        touchForm: [touchForm],

        resetForm: [resetFormCustom(State`${Props`path`}`)],

        resetRequest: [set(State`${Props`path`}`, APIResponse())],

        toggleFieldArray: [
            ({ state, props }) => {
                if (!state.get(props.path).value) {
                    state.set(props.path + '.value', []);
                }
            },

            ({ state, props, path }) => {
                const list = state.get(props.path).value;

                const value = props.value;

                const index = props.key ? findIndex(list, [props.key, value[props.key]]) : list.indexOf(value);

                if (index > -1) {
                    return path.remove({ index });
                } else {
                    return path.push();
                }
            },
            {
                remove: [splice(State`${Props`path`}.value`, Props`index`, 1)],
                push: [push(State`${Props`path`}.value`, Props`value`)],
            },
        ],
    },
});

function touchForm({ state, props: { form, fields } }) {
    if (!form) {
        throw new Error('touchForm: property "form" invalid!');
    }

    if (!fields) {
        fields = Object.keys(state.get(form));
    }

    fields.map(v => {
        state.set(`${form}.${v}.touched`, true);
    });
}
