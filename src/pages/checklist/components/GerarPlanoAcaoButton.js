/* eslint-disable react/no-did-mount-set-state */
import { connect } from '@cerebral/react';
import { signal } from 'cerebral/tags';
import React from 'react';
import { Button, Loading, Spacer } from '../../../components';
import { makePromise } from '../../../utils/CerebralUtil';

class GerarPlanoAcaoButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { validating: false, permiteCriacao: false };
    }

    componentDidMount() {
        const { promise, id } = makePromise();

        this.setState({ validating: true });
        const { signalValidaCriacaoPDACheckList, checklistUnidadeProdutivaId } = this.props;
        signalValidaCriacaoPDACheckList({ checklistUnidadeProdutivaId, onComplete: id });

        promise.then(data => {
            this.setState({
                validating: false,
                permiteCriacao: this.props.permiteCriacao && data.countChecklistPDA > 0,
            });
        });
    }

    render() {
        const { validating, permiteCriacao } = this.state;
        const { onGerarPress } = this.props;

        if (validating) {
            return <Loading />;
        }

        if (!permiteCriacao) {
            return null;
        }

        return (
            <>
                <Button mode="contained" onPress={onGerarPress}>
                    GERAR PLANO DE AÇÃO
                </Button>
                <Spacer />
            </>
        );
    }
}

export default connect(
    { signalValidaCriacaoPDACheckList: signal`planoAcao.validaCriacaoPDACheckList` },
    GerarPlanoAcaoButton
);
