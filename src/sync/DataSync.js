import { modal } from '../modules/addons';
import { sanitizeModel } from './SyncUtil';

const log = require('debug')('DataSync');

const DataSync = async function DataSync(ctx) {
    const { db, http } = ctx;

    const tables = [
        'produtores',
        'unidade_produtivas',
        'produtor_unidade_produtiva',
        'unidade_produtiva_certificacoes',
        'unidade_produtiva_pressao_sociais',
        'unidade_produtiva_canal_comercializacoes',
        'unidade_produtiva_tipo_fonte_aguas',
        'unidade_produtiva_risco_contaminacao_aguas',
        'unidade_produtiva_solo_categorias',
        'unidade_produtiva_caracterizacoes',
        'colaboradores',
        'instalacoes',
        'cadernos',
        'caderno_resposta_caderno',
        'unidade_produtiva_respostas',
        'checklist_unidade_produtivas',
        'plano_acoes',
        'plano_acao_itens',
        'plano_acao_historicos',
        'plano_acao_item_historicos',
        'checklist_snapshot_respostas',
        'unidade_produtiva_esgotamento_sanitarios',
        'unidade_produtiva_residuo_solidos',
    ];

    const definition = tables.map((name) => {
        return {
            name,
            records: [],
        };
    });

    await Promise.all(
        definition.map(async (def) => {
            log(`Parallel ${def.name}`);
            const [data] = await db.exec(`SELECT * FROM ${def.name} WHERE app_sync = 1`);
            def.records = data.rows.raw();
            log(`Found ${def.records.length} ${def.name} record(s)`);
            log(def.records);
        })
    );

    // for (let def of definition) {
    //     const [data] = await db.exec(`SELECT * FROM ${def.name} WHERE app_sync = 1`);
    //     def.records = data.rows.raw();
    //     log(`Found ${def.records.length} ${def.name} record(s)`);
    //     log(def.records);
    // }

    const hasRecords = definition.filter((def) => def.records.length > 0).length > 0;

    if (hasRecords) {
        const postData = definition.reduce((obj, def) => {
            obj[def.name] = def.records;
            return obj;
        }, {});

        const request = await http.post('/offline/update', postData);

        log('Result ' + JSON.stringify(request.result));

        let errorVersionMsgs = [];
        for (const entryName in request.result) {
            if (!request.result[entryName]) {
                continue;
            }

            const { error, errorVersion, success } = request.result[entryName];

            const successString = success.map((v) => (isNaN(v) ? `"${v}"` : v));

            if (success.length > 0) {
                await db.exec(`UPDATE ${entryName} SET app_sync = 0 WHERE id IN (${successString.join(',')})`);
            }

            if (error.length > 0) {
                for (let errorData of error) {
                    if (errorData.db === null) {
                        log(`Deleting ${entryName} ${errorData.app.id} because of error: ${errorData.message}`);
                        await db.exec(`DELETE FROM ${entryName} where id=:id`, [errorData.app.id]);
                    } else {
                        log(`Updating ${entryName} ${errorData.app.id} because of error: ${errorData.message}`);
                        // mantemos o updated_at antigo, caso contrário pode "pular" registros na hora do download
                        const updatedModel = {
                            ...errorData.db,
                            updated_at: errorData.app.updated_at,
                            created_at: errorData.app.created_at,
                        };
                        await db.insertOrUpdate(entryName, sanitizeModel(updatedModel));
                    }

                    if (!errorData.message || errorData.message.toString() == '-1') {
                        continue;
                    }

                    await modal(
                        {
                            title: 'Alerta ao sincronizar',
                            content: `${errorData.message}
                            
Registro: ${entryName} (${errorData.app.id})`,
                        },
                        [{ path: 'ok', label: 'CONTINUAR' }]
                    )(ctx, true);
                }
            }

            if (errorVersion.length > 0) {
                const names = errorVersion.map(({ app }) => {
                    return app.id + ' ' + (app.nome || '');
                });

                errorVersionMsgs.push({
                    entryName,
                    names,
                });
            }
        }

        if (errorVersionMsgs.length > 0) {
            const clickOption = await modal(
                {
                    title: 'Alerta ao sincronizar',
                    content: `Algumas alterações de registros foram ignoradas por que haviam versões mais recentes no servidor.`,
                },
                [
                    { path: 'more', label: 'VER DETALHES' },
                    { path: 'ok', label: 'CONTINUAR' },
                ]
            )(ctx, true);

            if (clickOption === 'more') {
                const msg = errorVersionMsgs
                    .map(({ entryName, names }) => {
                        return `Tipo: ${entryName}\n` + names.join(', ');
                    })
                    .join(`\n \n`);

                await modal({ title: 'Alerta ao sincronizar', content: msg }, [{ path: 'ok', label: 'CONTINUAR' }])(
                    ctx,
                    true
                );
            }
        }
    }

    return { hasSyncRecords: hasRecords };
};

export default DataSync;
