import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React from 'react';
import { getRepository } from 'typeorm/browser';
import { ActionRoute } from '../../components';
import ChecklistUnidadeProdutiva, {
    ChecklistUnidadeProdutivaStatus,
} from '../../db/typeORM/ChecklistUnidadeProdutivaModel';
import { makePromise } from '../../utils/CerebralUtil';

class CadastroChecklistPage extends React.Component {
    static propTypes = {};

    async componentDidMount() {
        const { checklistId, produtorId, unidadeProdutivaId } = this.props.match.params;

        const { promise, id } = makePromise();

        this.props.signalInit({
            onComplete: id,
        });

        promise.then(async data => {
            const repo = getRepository(ChecklistUnidadeProdutiva);

            let model = await repo.findOne({
                checklist_id: checklistId,
                produtor_id: produtorId,
                unidade_produtiva_id: unidadeProdutivaId,
                status: ChecklistUnidadeProdutivaStatus.rascunho,
                deleted_at: null,
            });

            if (model) {
                ActionRoute.replace(`/editarChecklist/${model.id}`);
                return;
            }

            model = await repo.findOne({
                checklist_id: checklistId,
                produtor_id: produtorId,
                unidade_produtiva_id: unidadeProdutivaId,
                status: ChecklistUnidadeProdutivaStatus.aguardando_aprovacao,
                deleted_at: null,
            });

            if (model) {
                this.props.alertErroCriacaoChecklist({
                    mensagem: 'Não é possível aplicar um novo formulário. Espere a revisão do formulário aplicado.',
                });
                return;
            }

            model = await repo.findOne({
                checklist_id: checklistId,
                produtor_id: produtorId,
                unidade_produtiva_id: unidadeProdutivaId,
                status: ChecklistUnidadeProdutivaStatus.aguardando_pda,
                deleted_at: null,
            });

            if (model) {
                this.props.alertErroCriacaoChecklist({
                    mensagem:
                        'Não é possível aplicar um novo formulário. O formulário esta aguardando a criação de um plano de ação.',
                });
                return;
            }

            model = repo.create({
                checklist_id: checklistId,
                produtor_id: produtorId,
                unidade_produtiva_id: unidadeProdutivaId,
                status: ChecklistUnidadeProdutivaStatus.rascunho,
                user_id: this.props.userId,
                app_sync: 0,
                can_update: true,
                can_view: true,
                can_delete: false,
            });

            try {
                await repo.save(model);
            } catch (e) {
            }

            ActionRoute.replace(`/editarChecklist/${model.id}`);
        });
    }

    render() {
        return null;
    }
}

export default connect(
    {
        signalInit: signal`checklist.init`,
        userId: state`auth.user.id`,
        alertErroCriacaoChecklist: signal`checklist.alertErroCriacaoChecklist`,
    },
    CadastroChecklistPage
);
