import { insertWithTransaction, syncAll } from './SyncUtil';

export default (async function DadosGeraisDownload(ctx) {
    const { db, http } = ctx;

    const tables = [
        'termos_de_usos',
        'users',
        'assistencia_tecnica_tipos',
        'generos',
        'etinias',
        'tipo_posses',
        'canal_comercializacoes',
        'solo_categorias',
        'risco_contaminacao_aguas',
        'tipo_fonte_aguas',
        'relacoes',
        'dedicacoes',
        'outorgas',
        'instalacao_tipos',
        'certificacoes',
        'pressao_sociais',
        'dominios',

        'grau_instrucoes',
        'rendimento_comercializacoes',
        'renda_agriculturas',
        'esgotamento_sanitarios',
        'residuo_solidos',
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
            const[data] = await db.exec(`SELECT updated_at FROM ${def.name} ORDER BY DATETIME(updated_at) DESC LIMIT 1`);
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

    const request = await http.post('/offline/dados_gerais', query);

    if (recordCount === 0) {
        await insertWithTransaction(request.result.data, db);
    } else {
        await syncAll(request.result.data, db);
    }
});
