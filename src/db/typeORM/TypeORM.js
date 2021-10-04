import { createConnection } from 'typeorm/browser';
import ChecklistCategoria from './ChecklistCategoriaModel';
import Checklist from './ChecklistModel';
import ChecklistPergunta from './ChecklistPerguntaModel';
import ChecklistSnapshotRespostas from './ChecklistSnapshotResposta';
import ChecklistSnapshotRespostaSub from './ChecklistSnapshotRespostaSub';
import ChecklistUnidadeProdutiva from './ChecklistUnidadeProdutivaModel';
import ChecklistUnidadeProdutivaSub from './ChecklistUnidadeProdutivaSub';
import Pergunta from './PerguntaModel';
import Produtor from './ProdutorModel';
import Resposta from './RespostaModel';
import UnidadeProdutiva from './UnidadeProdutivaModel';
import UnidadeProdutivaRespostaArquivo from './UnidadeProdutivaRespostaArquivoModel';
import UnidadeProdutivaRespostaArquivoSub from './UnidadeProdutivaRespostaArquivoSub';
import UnidadeProdutivaResposta from './UnidadeProdutivaRespostaModel';
import UnidadeProdutivaRespostaSub from './UnidadeProdutivaRespostaSub';
import Usuario from './Usuario';

export default async function() {
    const connection = await createConnection({
        type: 'react-native',
        database: 'ater.db',
        location: 'default',
        logging: ['error', 'query', 'schema'],
        synchronize: false,
        subscribers: [
            UnidadeProdutivaRespostaSub,
            UnidadeProdutivaRespostaArquivoSub,
            ChecklistUnidadeProdutivaSub,
            ChecklistSnapshotRespostaSub,
        ],
        entities: [
            Usuario,
            ChecklistCategoria,
            Checklist,
            ChecklistPergunta,
            ChecklistUnidadeProdutiva,
            Pergunta,
            Produtor,
            Resposta,
            UnidadeProdutiva,
            UnidadeProdutivaResposta,
            UnidadeProdutivaRespostaArquivo,
            ChecklistSnapshotRespostas,
        ],
    });

    return connection;
}

// const data = await v
// .getRepository(Pergunta)
// .createQueryBuilder('p')
// .leftJoinAndSelect('p.respostas', 'respostas')
// .where('p.id = :id and respostas.deleted_at is null', { id: 1 })
// .getOne();
