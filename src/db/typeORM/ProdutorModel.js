import { Column, Entity } from 'typeorm/browser';

@Entity('produtores')
class Produtor {
    @Column({ type: 'varchar', primary: true })
    id = undefined;

    @Column({ type: 'varchar' })
    nome = '';

    @Column({ type: 'varchar' })
    deleted_at = '';
}

export default Produtor;
