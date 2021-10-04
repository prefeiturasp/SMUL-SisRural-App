import FormsProvider from '@cerebral/forms';

import moment from 'moment';

/**
 * Ex: validationRules: ['isRequired', 'isEmail'],
 */
export default FormsProvider({
    rules: {
        isRequired: function(value, arg, get) {
            return value ? !!value.toString().replace(/ /g, '') : false;
        },
        isDate: function isDate(value, arg, get) {
            if (!value) {
                return true;
            }
            return value && value.length === 10 ? moment(value, 'DD/MM/YYYY').isValid() : false;
        },
        isPassword(value, arg, get) {
            return value && value.length >= 6;
        },
        isCpf(value, arg, get) {
            if (!value) {
                return true;
            }

            return isCpf(value);
        },
        isCnpj(value, arg, get) {
            if (!value) {
                return true;
            }

            return isCnpj(value);
        },
    },
    errorMessages: {
        isRequired: () => 'Campo obrigatório',
        isDate: () => 'Data inválida',
        isEmail: () => 'E-mail inválido',
        isCpf: () => 'CPF inválido',
        isCnpj: () => 'CNPJ inválido',
    },
});

function isCnpj(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj === '') {
        return false;
    }

    if (cnpj.length !== 14) {
        return false;
    }

    // Elimina CNPJs invalidos conhecidos
    if (
        cnpj === '00000000000000' ||
        cnpj === '11111111111111' ||
        cnpj === '22222222222222' ||
        cnpj === '33333333333333' ||
        cnpj === '44444444444444' ||
        cnpj === '55555555555555' ||
        cnpj === '66666666666666' ||
        cnpj === '77777777777777' ||
        cnpj === '88888888888888' ||
        cnpj === '99999999999999'
    ) {
        return false;
    }

    // Valida DVs
    var tamanho = cnpj.length - 2;
    var numeros = cnpj.substring(0, tamanho);
    var digitos = cnpj.substring(tamanho);
    var soma = 0;
    var pos = tamanho - 7;
    for (var i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }

    var resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado.toString() !== digitos.charAt(0).toString()) {
        return false;
    }

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado.toString() !== digitos.charAt(1).toString()) {
        return false;
    }
    return true;
}

function isCpf(value) {
    value = value
        .split('.')
        .join('')
        .replace('-', '');

    if (value.length !== 11) {
        return false;
    }
    let Soma;
    let Resto;
    Soma = 0;

    if (
        value === '00000000000' ||
        value === '11111111111' ||
        value === '22222222222' ||
        value === '33333333333' ||
        value === '44444444444' ||
        value === '55555555555' ||
        value === '66666666666' ||
        value === '77777777777' ||
        value === '88888888888' ||
        value === '99999999999'
    ) {
        return false;
    }

    for (let i = 1; i <= 9; i++) {
        Soma = Soma + parseInt(value.substring(i - 1, i)) * (11 - i);
    }
    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) {
        Resto = 0;
    }
    if (Resto !== parseInt(value.substring(9, 10))) {
        return false;
    }

    Soma = 0;

    for (let i = 1; i <= 10; i++) {
        Soma = Soma + parseInt(value.substring(i - 1, i)) * (12 - i);
    }

    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) {
        Resto = 0;
    }

    if (Resto !== parseInt(value.substring(10, 11))) {
        return false;
    }

    return true;
}
