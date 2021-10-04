import { Column, Entity, OneToMany } from 'typeorm/browser';
import ChecklistCategoria from './ChecklistCategoriaModel';

export const ChecklistPlanoAcao = {
    nao_criar: 'nao_criar',
    obrigatorio: 'obrigatorio',
    opcional: 'opcional',
};

@Entity('checklists')
class Checklist {
    @Column({ type: 'varchar', primary: true })
    id = undefined;

    @Column({ type: 'varchar' })
    nome = '';

    @Column({ type: 'integer', default: 1 })
    fl_fluxo_aprovacao = '';

    @Column({ type: 'integer', default: 0 })
    fl_gallery = '';

    @Column({ type: 'varchar' })
    plano_acao = '';

    @Column({ type: 'varchar' })
    instrucoes = '';

    @Column({ type: 'varchar' })
    tipo_pontuacao = ''; //com_pontuacao, com_pontuacao_formula_personalizada, sem_pontuacao

    @Column({ type: 'varchar' })
    deleted_at = '';

    @OneToMany(type => ChecklistCategoria, categoria => categoria.checklist)
    categorias = undefined;
}

export default Checklist;
