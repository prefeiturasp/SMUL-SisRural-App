import PropTypes from 'prop-types';
import React from 'react';
import { Image } from 'react-native';

class IconImage extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string,
        size: PropTypes.number,
        color: PropTypes.string,
    };

    static Icons = {
        closeWhite: {
            label: 'closeWhite',
            image: require('./images/closeWhite.png'),
            width: 18,
            height: 18,
        },
        caderno: {
            label: 'caderno',
            image: require('./images/caderno.png'),
            width: 24,
            height: 24,
        },
        produtor: {
            label: 'produtor',
            image: require('./images/produtor.png'),
            width: 24,
            height: 24,
        },
        unidadeProdutiva: {
            label: 'unidadeProdutiva',
            image: require('./images/unidade-produtiva.png'),
            width: 24,
            height: 24,
        },
        planoAcao: {
            label: 'planoAcao',
            image: require('./images/plano-acao.png'),
            width: 24,
            height: 24,
        },

        prioritaria: {
            label: 'prioritaria',
            image: require('./images/prioritaria.png'),
            width: 24,
            height: 24,
        },
        recomendada: {
            label: 'recomendada',
            image: require('./images/recomendada.png'),
            width: 24,
            height: 24,
        },
        atendida: {
            label: 'atendida',
            image: require('./images/atendida.png'),
            width: 24,
            height: 24,
        },

        cancelado: {
            label: 'cancelado',
            image: require('./images/cancelado.png'),
            width: 20,
            height: 20,
        },
        concluido: {
            label: 'concluido',
            image: require('./images/concluido.png'),
            width: 20,
            height: 20,
        },
        emAndamento: {
            label: 'emAndamento',
            image: require('./images/em-andamento.png'),
            width: 20,
            height: 20,
        },
        naoIniciado: {
            label: 'naoIniciado',
            image: require('./images/nao-iniciado.png'),
            width: 20,
            height: 20,
        },
    };

    render() {
        const { color, name, size } = this.props;

        const icon = IconImage.Icons[name];

        return (
            <Image
                source={icon.image}
                style={{ width: size ? size : icon.width, height: size ? size : icon.height, tintColor: color }}
                resizeMode={'contain'}
                tintColor={color}
            />
        );
    }
}

export default IconImage;
