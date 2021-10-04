import { Column, Entity } from 'typeorm/browser';

@Entity('users')
class Usuario {
    @Column({ type: 'int', primary: true })
    id = undefined;

    @Column({ type: 'varchar' })
    first_name = '';

    @Column({ type: 'varchar' })
    last_name = '';
}

export default Usuario;
