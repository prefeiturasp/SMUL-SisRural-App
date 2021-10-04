import { EventSubscriber } from 'typeorm/browser';
import { generateId } from '../Db';
import UnidadeProdutivaResposta from './UnidadeProdutivaRespostaModel';

@EventSubscriber()
class UnidadeProdutivaRespostaSub {
    listenTo() {
        return UnidadeProdutivaResposta;
    }

    beforeInsert(event) {
        event.entity.id = event.entity.id || generateId();
    }
}

export default UnidadeProdutivaRespostaSub;
