import PropTypes from 'prop-types';
import { convertPropsTypes } from './utils/ThemeUtil';

const Theme = {
    fontFamily: {
        fontRegular: 'Roboto',
        fontBold: 'Roboto-Bold',
        fontMedium: 'Roboto-Medium',
        fontSemiBold: 'Roboto-SemiBold',
    },

    colors: {
        black: '#000000',
        white: '#fff',
        whiteTwo: '#fafafa',

        red: '#FF0000', //forms
        redLight: '#FF675E',

        teal: '#08885b', //primary
        tealNegative: '#43a36a',

        semaforicaGreen: '#7AD468',
        semaforicaYellow: '#FDDF84',
        semaforicaRed: '#FC6861',
        semaforicaGrey: '#BDBDBD',
        semaforicaNumerica: '#F5F5F5',

        // paleTeal: ' #7bc9b8',
        paleTeal10: '#E5EFEF', //pale_teal #7bc9b8, opacity 10%
        paleGreyBg: '#f2f4f7', //pale_grey_two
        paleGrey: '#e4e7eb',
        paleGreyTwo: '#e6e8ee',
        lightGreen: '#EAF6F3',
        coolGrey: '#9ea0a5',
        coolGreyLight: '#acadb2', //cool_grey_two
        greyE0: '#E0E0E0',

        slateGrey: '#56575a',
        charcoal: '#3a3b3f',

        greyBlue: '#66788a', //hint
        waterBlue: '#1070ca',
        // blue: '#1665d8', //primary
        blueWhite: '#DBE5F3',

        darkGreyBg: '#171c23', //bg
        darkGrey: '#212529', //text

        coral: 'rgb(250, 83, 83)', //ToastTop
        flatBlue: 'rgb(49, 124, 162)', //ToastTop

        disabled: 'rgba(0, 0, 0, .65)', //'red'
    },

    sizes: {
        size10: 10,
        size12: 12,
        size14: 14, //label
        size16: 16, //textinput
        size18: 18,
        size20: 20,
        size24: 24,
        size32: 32,
        size38: 38,
    },

    lnh: {},
};

export const PropTypesColors = convertPropsTypes(Theme.colors, PropTypes.bool);

export const PropTypesFontFamily = convertPropsTypes(Theme.fontFamily, PropTypes.bool);

export const PropTypesSizes = convertPropsTypes(Theme.sizes, PropTypes.bool);

export default Theme;
