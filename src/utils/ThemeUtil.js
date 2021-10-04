import _pick from 'lodash/pick';
import _invert from 'lodash/invert';

import defaultTheme from '../Theme';

export function convertPropsToStyle(props, propertyTheme, property, elementStyle, Theme = defaultTheme) {
    if (props[property]) {
        if (Theme[propertyTheme][props[property]]) {
            const style = {};
            style[property] = Theme[propertyTheme][props[property]];
            elementStyle.push(style);
        }
    }

    const pick = _pick(props, Object.keys(Theme[propertyTheme]));
    const value = _invert(pick, true).true;

    if (value) {
        const style = {};
        style[property] = Theme[propertyTheme][value];
        elementStyle.push(style);
    }
}
export function convertPropsTypes(obj, type) {
    const propType = {};
    Object.keys(obj).map(v => {
        propType[v] = type;
    });
    return propType;
}

export default {
    convertPropsToStyle,
    convertPropsTypes,
};
