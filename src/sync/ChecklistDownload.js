import { insertWithTransaction, syncAll } from './SyncUtil';

// const debug = require('debug')('ProdutorDownload');

export default (async function ChecklistDownload(ctx) {
    const { db, http } = ctx;

    const tables = [
        'checklist_unidade_produtivas',
        'checklist_snapshot_respostas',
        'unidade_produtiva_respostas',
        'unidade_produtiva_resposta_arquivos',
        'checklist_aprovacao_logs',
    ];

    const definition = tables.map((name) => {
        return {
            name,
            lastUpdate: 0,
        };
    });

    //Invalida o conjunto de respostas das unidades produtivas quando forem duplicadas p/ fazer um novo sync
    const [dataCount] = await db.exec(`SELECT pergunta_id, unidade_produtiva_id, count(resposta_id) as total 
    FROM unidade_produtiva_respostas, perguntas 
    where unidade_produtiva_respostas.pergunta_id = perguntas.id and perguntas.tipo_pergunta != 'multipla-escolha' and unidade_produtiva_respostas.deleted_at is null
    group by pergunta_id, unidade_produtiva_id having total > 1`);
    if (dataCount.rows.length > 0) {
        await db.exec(`DELETE FROM unidade_produtiva_respostas`);
    }

    let recordCount = 0;
    await Promise.all(
        definition.map(async (def) => {
            const [data] = await db.exec(
                `SELECT updated_at FROM ${def.name} ORDER BY DATETIME(updated_at) DESC LIMIT 1`
            );
            recordCount += data.rows.length;
            if (data.rows.length > 0) {
                def.lastUpdate = data.rows.item(0).updated_at;
            }
        })
    );

    // for (const def of definition) {
    //     const [data] = await db.exec(`SELECT updated_at FROM ${def.name} ORDER BY DATETIME(updated_at) DESC LIMIT 1`);
    //     recordCount += data.rows.length;
    //     if (data.rows.length > 0) {
    //         def.lastUpdate = data.rows.item(0).updated_at;
    //     }
    // }

    const query = definition.reduce((obj, def) => {
        obj['updated_at_' + def.name] = def.lastUpdate;
        return obj;
    }, {});

    const request = await http.post('/offline/checklists', query);

    if (recordCount === 0) {
        await insertWithTransaction(request.result.data, db);
    } else {
        await syncAll(request.result.data, db);
    }
});
