import { insertWithTransaction, syncAll } from './SyncUtil';

// const debug = require('debug')('ProdutorDownload');

export default (async function UnidadeProdutivaDownload(ctx) {
    const { db, http } = ctx;

    const tables = [
        'unidade_produtivas',
        'unidade_produtiva_certificacoes',
        'unidade_produtiva_pressao_sociais',
        'unidade_produtiva_canal_comercializacoes',
        'unidade_produtiva_tipo_fonte_aguas',
        'unidade_produtiva_risco_contaminacao_aguas',
        'unidade_produtiva_solo_categorias',
        'unidade_produtiva_caracterizacoes',
        'colaboradores',
        'instalacoes',
        'unidade_produtiva_arquivos',
        'unidade_produtiva_residuo_solidos',
        'unidade_produtiva_esgotamento_sanitarios',
    ];

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

    const request = await http.post('/offline/unidade_produtivas', query);

    if (recordCount === 0) {
        await insertWithTransaction(request.result.data, db);
    } else {
        await syncAll(request.result.data, db);
    }
});
