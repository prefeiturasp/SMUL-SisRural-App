import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm/browser';
import Pergunta from './PerguntaModel';

@Entity('respostas')
class Resposta {
    @Column({ type: 'varchar', primary: true })
    id = undefined;

    @Column({ type: 'varchar' })
    pergunta_id = '';

    @Column({ type: 'varchar' })
    descricao = '';

    @Column({ type: 'varchar' })
    cor = '';

    @Column({ type: 'varchar' })
    texto_apoio = '';

    @Column({ type: 'integer' })
    ordem = 0;

    @Column({ type: 'varchar' })
    deleted_at = '';

    @JoinColumn({
        referencedColumnName: 'id',
        name: 'pergunta_id',
    })
    @ManyToOne(type => Pergunta, pergunta => pergunta.respostas, {})
    pergunta = undefined;
}

export default Resposta;
