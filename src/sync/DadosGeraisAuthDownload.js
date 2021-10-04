import { insertWithTransaction, syncAll } from './SyncUtil';

import difference from 'lodash/difference';

export default (async function DadosGeraisAuthDownload(ctx) {
    const { db, http, controller } = ctx;

    const tables = [
        'templates',
        'template_pergunta_templates',
        'template_perguntas',
        'template_respostas',
        //
        'unidade_operacionais',
        //
        'checklists',
        'checklist_categorias',
        'checklist_perguntas',
        'perguntas',
        'respostas',
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

    const request = await http.post('/offline/dados_gerais_auth', query);

    if (recordCount === 0) {
        await insertWithTransaction(request.result.data, db);
    } else {
        const [unidadesOperacionais] = await db.exec(`SELECT * FROM unidade_operacionais`);

        await syncAll(request.result.data, db);

        const [newUnidadesOperacionais] = await db.exec(`SELECT * FROM unidade_operacionais`);

        const abrangenciaAt = unidadesOperacionais.rows.raw().map(function (v) {
            return v.id + '_' + v.abrangencia_at;
        });
        const abrangenciaAtNew = newUnidadesOperacionais.rows.raw().map(function (v) {
            return v.id + '_' + v.abrangencia_at;
        });

        if (difference(abrangenciaAt, abrangenciaAtNew).length > 0) {
            controller.getSignal('auth.logoutSilent')();
            alert('A abrangência de sua unidade operacional foi alterada, você precisará logar novamente.');
        }
    }
});
