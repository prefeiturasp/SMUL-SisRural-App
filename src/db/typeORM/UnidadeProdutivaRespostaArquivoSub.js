import { EventSubscriber } from 'typeorm/browser';
import { generateId } from '../Db';
import UnidadeProdutivaRespostaArquivo from './UnidadeProdutivaRespostaArquivoModel';

@EventSubscriber()
class UnidadeProdutivaRespostaArquivoSub {
    listenTo() {
        return UnidadeProdutivaRespostaArquivo;
    }

    beforeInsert(event) {
        event.entity.id = event.entity.id || generateId();
    }
}

export default UnidadeProdutivaRespostaArquivoSub;
