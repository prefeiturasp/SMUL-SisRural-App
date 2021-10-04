import { Column, Entity, OneToMany } from 'typeorm/browser';
import Resposta from './RespostaModel';

@Entity('perguntas')
class Pergunta {
    @Column({ type: 'varchar', primary: true })
    id = undefined;

    @Column({ type: 'varchar' })
    tipo_pergunta = '';

    @Column({ type: 'varchar' })
    pergunta = '';

    @Column({ type: 'varchar' })
    texto_apoio = '';

    @Column({ type: 'varchar' })
    tabela_colunas = '';

    @Column({ type: 'varchar' })
    tabela_linhas = '';

    @Column({ type: 'varchar' })
    deleted_at = '';

    @OneToMany(type => Resposta, resposta => resposta.pergunta)
    respostas = undefined;
}

export default Pergunta;
