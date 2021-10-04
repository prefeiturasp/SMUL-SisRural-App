import { modal } from '../modules/addons';

const log = require('debug')('FileSync');

const FileSync = async function FileSync(ctx) {
    const { db, http, props } = ctx;

    const tables = ['caderno_arquivos', 'unidade_produtiva_arquivos', 'unidade_produtiva_resposta_arquivos', 'checklist_unidade_produtiva_arquivos'];

    let hasRecords = false;

    for (let table of tables) {
        const [data] = await db.exec(`SELECT * FROM ${table} WHERE app_sync = 1`);
        const records = data.rows.raw();
        log(`Found ${records.length} ${table} record(s)`);
        log(records);

        hasRecords = hasRecords || records.length > 0;

        for (let record of records) {
            const body = new FormData();
            if (record.app_arquivo_caminho) {
                body.append('app_arquivo_caminho', {
                    uri: 'file://' + record.app_arquivo_caminho,
                    type: 'text/plain',
                    name: record.app_arquivo_caminho.split('/').pop(),
                });
            }

            body.append('data', JSON.stringify(record));

            const request = await http.post('/offline/file_upload/' + table, body, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Cache-Control': 'no-cache',
                },
            });

            const { error, errorVersion, success, ids } = request.result[table];

            const successString = success.map(v => (isNaN(v) ? `"${v}"` : v));

            if (success.length > 0) {
                await db.exec(`UPDATE ${table} SET app_sync = 0 WHERE id IN (${successString.join(',')})`);
            }

            if (error.length > 0) {
                for (let errorData of error) {
                    if (errorData.db === null) {
                        log(`Deleting ${table} ${errorData.app.id} because of error: ${errorData.message}`);
                        await db.exec(`DELETE FROM ${table} where id=:id`, [errorData.app.id]);
                    } else {
                        log(`Updating ${table} ${errorData.app.id} because of error: ${errorData.message}`);
                        // mantemos o updated_at antigo, caso contrário pode "pular" registros na hora do download
                        const updatedModel = {
                            ...errorData.db,
                            updated_at: errorData.app.updated_at,
                            created_at: errorData.app.created_at,
                        };
                        await db.insertOrUpdate(table, sanitizeModel(updatedModel));
                    }

                    await modal(
                        {
                            title: 'Alerta ao sincronizar',
                            content: `Registro: ${table}
ID: ${errorData.app.id}                          

Mensagem: ${errorData.message}                            `,
                        },
                        [{ path: 'ok', label: 'CONTINUAR' }]
                    )(ctx, true);
                }
            }

            if (errorVersion.length > 0) {
                const names = errorVersion.map(({ app }) => {
                    return app.id + ' ' + (app.nome || '');
                });

                const msg =
                    `As alterações nos registro do tipo (${table}) foram descartadas por que versões mais recentes do registro foram encontradas.  \n \n ` +
                    names.join(', ');

                await modal({ title: 'Alerta ao sincronizar', content: msg }, [{ path: 'ok', label: 'CONTINUAR' }])(
                    ctx,
                    true
                );
            }
        }
    }
    return { hasSyncRecords: hasRecords || props.hasSyncRecords };
};

export default FileSync;
