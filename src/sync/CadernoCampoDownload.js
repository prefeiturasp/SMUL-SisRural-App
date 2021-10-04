import { insertWithTransaction, syncAll } from './SyncUtil';

// const debug = require('debug')('ProdutorDownload');

export default (async function CadernoCampoDownload(ctx) {
    const { db, http } = ctx;

    const tables = ['cadernos', 'caderno_resposta_caderno', 'caderno_arquivos'];

    const definition = tables.map((name) => {
        return {
            name,
            lastUpdate: 0,
        };
    });

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

    const request = await http.post('/offline/caderno_campo', query);

    if (recordCount === 0) {
        await insertWithTransaction(request.result.data, db);
    } else {
        await syncAll(request.result.data, db);
    }
});
