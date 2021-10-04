import _ from 'lodash';

export const insertWithTransaction = (data, db) => {
    return new Promise((resolve, reject) => {
        const allPromises = [];
        db.transaction(tx => {
            Object.keys(data).map(tableName => {
                const records = data[tableName];

                records.forEach(dirtyModel => {
                    const model = sanitizeModel(dirtyModel);
                    const [sql, insertData] = modelToInsertSQL(tableName, model);
                    //Erros de "constraint" não dispara a promise "reject", caso o sync trave, é porque tem dados duplicados (mesmo ID)
                    //https://github.com/andpor/react-native-sqlite-storage/issues/388
                    allPromises.push(tx.executeSql(sql, insertData));
                });
            });

            return Promise.all(allPromises)
                .then(data => {
                    resolve(data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    });
};

export const syncAll = (data, db) => {
    const list = Object.keys(data).map(tableName => {
        const records = data[tableName];

        return records.map(model => {
            return () => {
                return sync(db, tableName, model);
            };
        });
    });
    const listChain = _.flatMap(list);

    return execChain(listChain);
};

export function sanitizeModel(model) {
    // remove o UID do model
    const { uid, ...rest } = model;
    return rest;
}

export async function sync(db, tableName, model) {
    const sanitizedModel = sanitizeModel(model);

    const [record] = await db.exec(`select id from "${tableName}" where id=:id`, [sanitizedModel.id]);

    let sql, data;

    if (record.rows.length === 0) {
        [sql, data] = modelToInsertSQL(tableName, sanitizedModel);
    } else {
        [sql, data] = modelToUpdateSQL(tableName, sanitizedModel);
    }

    return await db.exec(sql, data);
}

export function modelToInsertSQL(tableName, model) {
    const keys = Object.keys(model);

    const columnNames = keys.join(',');

    const valueNames = keys.map(v => '?').join(',');

    const data = keys.map(key => model[key]);

    return [`insert into "${tableName}" (${columnNames}) values (${valueNames}) `, data];
}

export function modelToUpdateSQL(tableName, model) {
    const keys = Object.keys(model);

    const columns = keys.map(v => v + '=?');

    const data = keys.map(key => model[key]);
    data.push(model.id);

    return [`update "${tableName}" set ${columns} where id=?`, data];
}

export async function execChain(arr) {
    const ret = [];
    for (const func of arr) {
        const value = await func();
        ret.push(value);
    }
    return ret;
}
