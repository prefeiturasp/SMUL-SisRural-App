import _ from 'lodash';
import moment from 'moment';
import SQLite from 'react-native-sqlite-storage';
import uuid from 'react-native-uuid';
import TypeORM from './typeORM/TypeORM';
SQLite.enablePromise(true);

const debug = require('debug')('Db');
const debugMigrator = require('debug')('DBMigrator');

const DB_FILENAME = 'ater.db';

export function generateId() {
    return 'app_' + uuid.v1();
}

export default class DB {
    _db = null;
    _typeORM = null;

    constructor() {}

    connect() {
        if (this._db) {
            return Promise.resolve(this._db);
        }

        return new Promise((resolve) => {
            SQLite.openDatabase({ name: DB_FILENAME }).then((db) => {
                this._db = db;

                this.exec('SELECT sqlite_version() as version').then((data) => {
                    debug('SQLITE VERSION ' + JSON.stringify(data[0].rows.item(0).version));

                    TypeORM().then((typeORM) => {
                        this._typeORM = typeORM;
                        resolve(db);
                    });
                });
            });
        });
    }

    transaction(callback) {
        return this._db.transaction(callback);
    }

    async dropDB() {
        debug('Dropping Database');

        try {
            if (this._typeORM) {
                await this._typeORM.close();
                this._typeORM = null;
            }

            await SQLite.deleteDatabase(DB_FILENAME);

            this._db = null;
        } catch (e) {
            console.log(e);
        }

        debug('Database deleted');
    }

    deleteItem(table, id) {
        return this.exec(`update ${table} set deleted_at = :deleted_at, app_sync = 1 where id = :id`, [
            moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            id,
        ]);
    }

    exec(query, params = []) {
        debug('Executing query: ' + query + ' ' + params.map((v) => JSON.stringify(v)));

        return this.connect()
            .then((db) => {
                return db.executeSql(query, params).then((data) => {
                    return data;
                });
            })
            .catch((err) => {
                throw new Error(err.message);
            });
    }

    generateId() {
        return generateId();
    }

    sanitizeValue(value) {
        if (value === '') {
            return null;
        }
        return value;
    }

    sanitizeData(data) {
        return _.reduce(
            data,
            (acc, value, key) => {
                acc[key] = this.sanitizeValue(value);
                return acc;
            },
            {}
        );
    }

    async insertOrUpdate(table, data) {
        let { id, ...rest } = this.sanitizeData(data);

        rest.app_sync = true;

        if (id) {
            const columns = Object.keys(rest);
            const sqlColumns = [];
            columns.map((v) => {
                sqlColumns.push(v + ' = :' + v);
                return null;
            });
            const sql = `UPDATE ${table} SET ${sqlColumns.join(',')} WHERE id =:id`;
            const [ret] = await this.exec(sql, [...Object.values(rest), id]);

            return { data: ret, id, create: false };
        } else {
            const columns = ['id', ...Object.keys(rest)];
            const newId = this.generateId();
            const values = [newId, ...Object.values(rest)];

            const sqlColumns = columns.join(',');
            const sqlValues = columns.join(',:');

            const sql = `INSERT INTO ${table}(${sqlColumns}) VALUES (:${sqlValues})`;

            const [ret] = await this.exec(sql, values);
            return { data: ret, id: newId, create: true };
        }
    }

    /**
     *
     * Essa função tem a mesma lógica do sync ->deleted_at do PHP
     *
     * 1 - Todos registros são removidos ("deleted_at" = now())
     * 2 - Varre os valores criando o novo objeto com "valor", "valor da primeira fk", "valor da segunda fk (caso tenha)", "deleted_at" = null
     * 3 - Com isso, caso não seja passado nenhum valor para salvar, todos são desabilitados
     * 4 - Caso tenha algum valor desabilitado e foi passado para ser salvo, ele habilita novamente
     * 5 - Caso não encontre nada, cria o registro do zero com os dados do "valor", "valor da primeira fk" e "valor da segunda fk" (caso tenha)
     *
     * @param {*} table
     * @param {*} fk
     * @param {*} fkValue
     * @param {*} column
     * @param {*} columnValues
     * @param {*} fk2
     * @param {*} fk2Value
     */
    async insertMultiple(table, fk, fkValue, column, columnValues, fk2 = null, fk2Value = null) {
        // await this.exec(`delete from ${table} where ${fk} = :${fk}`, [fkValue]);
        let sqlDeletedAt = `update ${table} set deleted_at = :deleted_at, app_sync = 1 where ${fk} = :${fk} `;
        let sqlDeletedAtValues = [moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), fkValue];

        if (fk2) {
            sqlDeletedAt = sqlDeletedAt + ` AND ${fk2} = :${fk2} `;
            sqlDeletedAtValues.push(fk2Value);
        }

        this.exec(sqlDeletedAt, sqlDeletedAtValues);

        const promises = columnValues.map(async (v) => {
            let ob = {};
            ob[fk] = fkValue;
            ob[column] = v;
            ob.deleted_at = null;

            if (fk2) {
                ob[fk2] = fk2Value;
            }

            const deletedItems = await this.getDeletedItems(table, fk, fkValue, column, v);
            if (deletedItems && deletedItems.length > 0) {
                ob.id = deletedItems[0].id;
            }
            const ret = await this.insertOrUpdate(table, ob);

            return ret;
        });

        return Promise.all(promises);
    }

    async getDeletedItems(table, fk, fkValue, column, value) {
        const [data] = await this.exec(`select * from ${table} where ${fk} = :${fk} AND ${column} = :${column}`, [
            fkValue,
            value,
        ]);

        return data.rows.raw();
    }

    async selectMultiple(table, fk, fkValue, column) {
        const [data] = await this.exec(`SELECT * FROM ${table} WHERE ${fk}=:id AND deleted_at IS NULL`, [fkValue]);

        return data.rows.raw().map((v) => v[column]);
    }
}

export class DBMigrator {
    _db = null;
    _init = false;

    constructor(db) {
        this._db = db;
    }

    async drop() {
        debugMigrator('Droping app_migrations table');
        await this._db.exec('DROP TABLE app_migrations');
    }

    async init() {
        if (this._init) {
            return;
        }

        const hasBeenMigrated = await this.hasBeenMigrated();

        if (!hasBeenMigrated) {
            debugMigrator('Creating app_migrations table');
            await this._db.exec(
                'CREATE TABLE IF NOT EXISTS app_migrations (table_name TEXT, hash TEXT,has_app_sync INTEGER)'
            );
        } else {
            debugMigrator('App_migrations already exists');
        }
        this._init = true;
    }

    async hasTable(tableName) {
        const [data] = await this._db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name=:name", [
            tableName,
        ]);

        return data.rows.length === 1;
    }

    async hasBeenMigrated() {
        return this.hasTable('app_migrations');
    }

    async createTable(table, columns) {
        const columnsSql = columns.map(({ field, type, nullable, defaultValue }) => {
            let primaryKey = field == 'id' ? ' PRIMARY KEY ' : '';
            return `${field} ${type} ${nullable} DEFAULT ${JSON.stringify(defaultValue)} ${primaryKey}`;
        });

        return await this._db.exec(`CREATE TABLE ${table} (${columnsSql.join(',')})`);
    }

    async migrate(table, hash, columns) {
        await this.init();

        const [data] = await this._db.exec('SELECT table_name,hash FROM app_migrations WHERE table_name=:table', [
            table,
        ]);

        if (data.rows.length === 0 || (data.rows.length > 0 && data.rows.item(0).hash !== hash)) {
            debugMigrator('Creating table ' + table);

            const hasAppSync = columns.filter(({ field }) => field === 'app_sync').length === 1;
            await this._db.exec(`DROP TABLE IF EXISTS "${table}"`);
            await this.createTable(table, columns);
            await this._db.exec('DELETE FROM app_migrations WHERE table_name=:table', [table]);
            await this._db.exec(
                'INSERT INTO app_migrations (table_name,hash,has_app_sync) values (:table,:hash,:hasAppSync)',
                [table, hash, hasAppSync]
            );
        } else {
            debugMigrator('Skipping table ' + table);
        }
    }
}
