import { Column, Entity } from 'typeorm/browser';

@Entity('unidade_produtiva_resposta_arquivos')
class UnidadeProdutivaRespostaArquivo {
    @Column({ type: 'varchar', primary: true })
    id = undefined;

    @Column({ type: 'varchar' })
    arquivo;

    @Column({ type: 'varchar' })
    app_arquivo;

    @Column({ type: 'varchar' })
    app_arquivo_caminho;

    @Column({ type: 'varchar' })
    unidade_produtiva_resposta_id;

    @Column({ type: 'varchar' })
    app_sync;

    @Column({ type: 'varchar' })
    deleted_at;
}

export default UnidadeProdutivaRespostaArquivo;
