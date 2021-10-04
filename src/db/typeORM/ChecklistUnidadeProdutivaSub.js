import { EventSubscriber } from 'typeorm/browser';
import { generateId } from '../Db';
import ChecklistUnidadeProdutiva from './ChecklistUnidadeProdutivaModel';

@EventSubscriber()
class ChecklistUnidadeProdutivaSub {
    listenTo() {
        return ChecklistUnidadeProdutiva;
    }

    beforeInsert(event) {
        event.entity.id = event.entity.id || generateId();
    }
}

export default ChecklistUnidadeProdutivaSub;
