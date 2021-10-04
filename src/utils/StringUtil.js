export function letters(name) {
    const v = name.split(' ');

    const pos = v.length === 1 ? 1 : 0;

    return v[0].toUpperCase().substring(0, 1) + v[v.length - 1].toUpperCase().substring(pos, pos + 1);
}

export function fullAddress(ob) {
    let ret = [];

    if (!ob) {
        return null;
    }

    if (ob.endereco) {
        ret.push(ob.endereco);
    }

    if (ob.bairro) {
        ret.push(ob.bairro);
    }

    if (ob.cidade) {
        ret.push(ob.cidade);
    }

    if (ob.estado) {
        ret.push(ob.estado);
    }

    return ret.join(', ');
}

export function formatCpf(value) {
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
}

export function formatCnpj(value) {
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5');
}

export function formatCpfOrCpnj(value) {
    if (!value) {
        return '';
    }

    if (value.length === 11) {
        return formatCpf(value);
    }
    if (value.length === 14) {
        return formatCnpj(value);
    }
    return value;
}

export function removeAccents(str) {
    var translate_re = /[àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ]/g;
    var translate = 'aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY';
    return str.replace(translate_re, function(match) {
        return translate.substr(translate_re.source.indexOf(match) - 1, 1);
    });
}
