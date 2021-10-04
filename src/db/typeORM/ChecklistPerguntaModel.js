import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm/browser';
import ChecklistCategoria from './ChecklistCategoriaModel';
import Pergunta from './PerguntaModel';

@Entity('checklist_perguntas')
class ChecklistPergunta {
    @Column({ type: 'varchar', primary: true })
    id;

    @Column({ type: 'varchar' })
    checklist_categoria_id;

    @Column({ type: 'varchar' })
    pergunta_id;

    @Column({ type: 'integer' })
    fl_obrigatorio;

    @Column({ type: 'varchar' })
    plano_acao_prioridade;

    @Column({ type: 'varchar' })
    deleted_at;

    @JoinColumn({
        referencedColumnName: 'id',
        name: 'pergunta_id',
    })
    @OneToOne(type => Pergunta, {})
    pergunta;

    @JoinColumn({
        referencedColumnName: 'id',
        name: 'checklist_categoria_id',
    })
    @ManyToOne(type => ChecklistCategoria, categoria => categoria.checklistPerguntas)
    checklistCategoria = undefined;
}

export default ChecklistPergunta;
