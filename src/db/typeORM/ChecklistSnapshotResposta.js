import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm/browser';
import Pergunta from './PerguntaModel';
import Resposta from './RespostaModel';

@Entity('checklist_snapshot_respostas')
class ChecklistSnapshotRespostas {
    @Column({ type: 'varchar', primary: true })
    id = undefined;

    @Column({ type: 'varchar' })
    pergunta_id;

    @Column({ type: 'varchar' })
    resposta_id;

    @Column({ type: 'varchar' })
    checklist_unidade_produtiva_id;

    @Column({ type: 'varchar' })
    resposta;

    @Column({ type: 'varchar' })
    deleted_at;

    @Column({ type: 'integer', default: 1 })
    app_sync;

    @JoinColumn({
        referencedColumnName: 'id',
        name: 'pergunta_id',
    })
    @ManyToOne(type => Pergunta, {})
    pergunta;

    // muito cuidado, já existe um campo resposta ( string ), por isso renomeiei para respostaModel
    @JoinColumn({
        referencedColumnName: 'id',
        name: 'resposta_id',
    })
    @ManyToOne(type => Resposta, {})
    respostaModel;
}

export default ChecklistSnapshotRespostas;
