import { Column, Entity, JoinColumn, OneToOne } from 'typeorm/browser';
import Checklist from './ChecklistModel';
import Produtor from './ProdutorModel';
import UnidadeProdutiva from './UnidadeProdutivaModel';
import Usuario from './Usuario';

export const ChecklistUnidadeProdutivaStatus = {
    rascunho: 'rascunho',
    aguardando_aprovacao: 'aguardando_aprovacao',
    aguardando_pda: 'aguardando_pda',
    finalizado: 'finalizado',
    cancelado: 'cancelado',
};

export const CUPFormatStatusFlow = (status) => {
    const STATUSES = {
        aguardando_revisao: 'Aguardando Revisão',
        aprovado: 'Aprovado',
        reprovado: 'Reprovado',
    };

    return STATUSES[status] || status;
};

export const CUPFormatStatus = (status) => {
    const STATUSES = {
        rascunho: 'Rascunho',
        finalizado: 'Finalizado',
        cancelado: 'Cancelado',
        aguardando_aprovacao: 'Aguardando Aprovacao',
        aguardando_pda: 'Aguardando Plano de Ação',
    };

    return STATUSES[status] || status;
};

@Entity('checklist_unidade_produtivas')
class ChecklistUnidadeProdutiva {
    @Column({ type: 'varchar', primary: true })
    id;

    @Column({ type: 'varchar' })
    checklist_id;

    @Column({ type: 'varchar', default: 'rascunho' })
    status;

    @Column({ type: 'varchar' })
    status_flow;

    @Column({ type: 'varchar' })
    deleted_at;

    @Column({ type: 'varchar' })
    created_at;

    @Column({ type: 'varchar' })
    updated_at;

    @Column({ type: 'varchar' })
    finished_at;

    @Column({ type: 'varchar' })
    produtor_id;

    @Column({ type: 'varchar' })
    unidade_produtiva_id;

    @Column({ type: 'integer', default: 1 })
    app_sync;

    @Column({ type: 'integer' })
    user_id;

    @Column({ type: 'integer' })
    finish_user_id;

    @JoinColumn({
        referencedColumnName: 'id',
        name: 'finish_user_id',
    })
    @OneToOne((type) => Usuario, {})
    finishUser;

    @JoinColumn({
        referencedColumnName: 'id',
        name: 'checklist_id',
    })
    @OneToOne((type) => Checklist, {})
    checklist;

    @JoinColumn({
        referencedColumnName: 'id',
        name: 'unidade_produtiva_id',
    })
    @OneToOne((type) => UnidadeProdutiva, {})
    unidadeProdutiva;

    @JoinColumn({
        referencedColumnName: 'id',
        name: 'produtor_id',
    })
    @OneToOne((type) => Produtor, {})
    produtor;

    @Column({ type: 'boolean' })
    can_update;

    @Column({ type: 'boolean' })
    can_delete;

    @Column({ type: 'boolean' })
    can_view;
}

export default ChecklistUnidadeProdutiva;
