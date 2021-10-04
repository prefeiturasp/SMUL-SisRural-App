import { resetForm } from '@cerebral/forms/operators';

export default function(formPath) {
    function resetFormTouched(_ref) {
        const state = _ref.state;
        const resolve = _ref.resolve;

        const path = resolve.path(formPath);

        state.set(path, resetObject(state.get(path)));
    }

    return [resetForm(formPath), resetFormTouched];
}

function resetObject(form) {
    return Object.keys(form).reduce(function(newForm, key) {
        if (form[key] === Object(form[key])) {
            if (Array.isArray(form[key])) {
                newForm[key] = resetArray(form[key]);
            } else if ('value' in form[key]) {
                newForm[key] = Object.assign({}, form[key], {
                    focus: false,
                    touched: false,
                });
            } else {
                newForm[key] = resetObject(form[key]);
            }
        }

        return newForm;
    }, {});
}

function resetArray(formArray) {
    return formArray.reduce(function(newFormArray, form, index) {
        newFormArray[index] = resetObject(form);
        return newFormArray;
    }, []);
}
