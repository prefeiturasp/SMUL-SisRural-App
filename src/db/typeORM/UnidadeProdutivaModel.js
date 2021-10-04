import { Column, Entity } from 'typeorm/browser';

@Entity('unidade_produtivas')
class UnidadeProdutiva {
    @Column({ type: 'varchar', primary: true })
    id = undefined;

    @Column({ type: 'varchar' })
    nome = '';

    @Column({ type: 'varchar' })
    deleted_at = '';
}

export default UnidadeProdutiva;
