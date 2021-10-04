import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm/browser';
import Checklist from './ChecklistModel';
import ChecklistPergunta from './ChecklistPerguntaModel';

@Entity('checklist_categorias')
class ChecklistCategoria {
    @Column({ type: 'varchar', primary: true })
    id = undefined;

    @Column({ type: 'varchar' })
    nome = '';

    @Column({ type: 'varchar' })
    checklist_id = '';

    @Column({ type: 'varchar' })
    deleted_at = '';

    @JoinColumn({
        referencedColumnName: 'id',
        name: 'checklist_id',
    })
    @ManyToOne(type => Checklist, checklist => checklist.categorias)
    checklist = undefined;

    @OneToMany(type => ChecklistPergunta, checklistPergunta => checklistPergunta.checklistCategoria)
    checklistPerguntas = undefined;
}

export default ChecklistCategoria;
