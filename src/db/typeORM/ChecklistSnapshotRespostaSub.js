import { EventSubscriber } from 'typeorm/browser';
import { generateId } from '../Db';
import ChecklistSnapshotRespostas from './ChecklistSnapshotResposta';

@EventSubscriber()
class ChecklistSnapshotRespostaSub {
    listenTo() {
        return ChecklistSnapshotRespostas;
    }

    beforeInsert(event) {
        event.entity.id = event.entity.id || generateId();
    }
}

export default ChecklistSnapshotRespostaSub;
