import { Module } from 'cerebral';
import { set, when } from 'cerebral/operators';
import { props, state } from 'cerebral/tags';
import RNExitApp from 'react-native-exit-app';
import { DBMigrator } from '../db/Db';
import CadernoCampoDownload from '../sync/CadernoCampoDownload';
import ChecklistDownload from '../sync/ChecklistDownload';
import DadosGeraisAuthDownload from '../sync/DadosGeraisAuthDownload';
import DadosGeraisDownload from '../sync/DadosGeraisDownload';
import DataSync from '../sync/DataSync';
import FileSync from '../sync/FileSync';
import PlanoAcoesDownload from '../sync/PlanoAcoesDownload';
import ProdutorDownload from '../sync/ProdutorDownload';
import RegioesDownload from '../sync/RegioesDownload';
import UnidadeProdutivaDownload from '../sync/UnidadeProdutivaDownload';
import { hideLoading, modal, showLoading } from './addons';
import logout from './auth/logout';
import { offlineCheckFlow } from './OfflineModule';

const debug = require('debug')('DBModule');

export const flowRunMigrations = [
    ({ db }) => {
        return db.connect();
    },
    showLoading('db.migrations', 'Sincronizando dados'),
    async ({ db, http, state }) => {
        const migrator = new DBMigrator(db);

        if (state.get('offline.isOnline')) {
            debug('Starting migrations');

            const data = await http.get('/offline/migrationsV2');

            for (const migration of data.result.migrations) {
                await migrator.migrate(migration.table, migration.hash, migration.columns);
            }
        } else {
            debug('Skipping migrations [Offline]');
        }

        const hasBeenMigrated = await migrator.hasBeenMigrated();
        debug('Has Been Migrated ' + hasBeenMigrated);
        return { hasBeenMigrated };
    },
    hideLoading('db.migrations'),
    when(props`hasBeenMigrated`),
    {
        true: [
            // não faz nada...
        ],
        false: [
            modal(
                {
                    title: 'Aviso',
                    content: `Parece que você está tentando executar a aplicação pela primeira vez mas encontra-se em modo OFFLINE.
                        
Conecte-se à Internet para sincronizar os dados e prosseguir.
                        `,
                },
                [{ label: 'ENTENDI', path: 'continue' }]
            ),
            {
                continue: [
                    () => {
                        RNExitApp.exitApp();
                    },
                ],
            },
        ],
    },
];

export function createSyncFlow(
    regioes = true,
    produtor = true,
    unidadeProdutiva = true,
    cadernoCampo = true,
    dadosGerais = true,
    dadosGeraisAuth = true,
    checklist = true,
    planoAcao = true
) {
    return [
        ...offlineCheckFlow,
        ({ db }) => {
            return db.connect();
        },
        when(state`offline.isOnline`),
        {
            true: [
                () => {
                    debug('Starting Sync and Download');
                },
                showLoading('db.syncing', 'Sincronizando dados'),
                async (ctx) => DataSync(ctx),
                async (ctx) => FileSync(ctx),
                when(
                    props`hasSyncRecords`,
                    state`db.lastSync`,
                    props`forceDownload`,
                    (hasSyncRecords, lastSync, forceDownload = false) => {
                        const dif = new Date().getTime() - lastSync;
                        return forceDownload || dif > 1000 * 15 || hasSyncRecords;
                    }
                ),
                {
                    true: [
                        ({ state }) => {
                            state.set('db.lastSync', new Date().getTime());
                        },
                        async (ctx) => (regioes ? RegioesDownload(ctx) : null),
                        async (ctx) => (produtor ? ProdutorDownload(ctx) : null),
                        async (ctx) => (unidadeProdutiva ? UnidadeProdutivaDownload(ctx) : null),
                        async (ctx) => (cadernoCampo ? CadernoCampoDownload(ctx) : null),
                        async (ctx) => (dadosGerais ? DadosGeraisDownload(ctx) : null),
                        async (ctx) => (dadosGeraisAuth ? DadosGeraisAuthDownload(ctx) : null),
                        async (ctx) => (checklist ? ChecklistDownload(ctx) : null),
                        async (ctx) => (planoAcao ? PlanoAcoesDownload(ctx) : null),
                    ],
                    false: [
                        () => {
                            debug('Skipping Download [recent last sync]');
                        },
                    ],
                },
            ],
            false: [
                () => {
                    debug('Skipping Sync and Download [Offline]');
                },
            ],
        },

        hideLoading('db.syncing'),
    ];
}

export const syncFlow = createSyncFlow();

const resetFlow = [
    modal(
        { title: 'Tem certeza?', content: 'Qualquer dado não sincronizado será perdido' },
        [
            { path: 'ok', label: 'Continuar' },
            { path: 'cancel', label: 'Cancelar' },
        ],
        'reset'
    ),
    {
        ok: [
            ({ db }) => {
                return db.dropDB();
            },
            logout,
            () => {
                RNExitApp.exitApp();
            },
        ],
        cancel: [],
    },
];

export default Module({
    state: {
        lastSync: 0,
    },
    signals: {
        sync: syncFlow,
        forceSync: [set(state`offline.isOnline`, true), offlineCheckFlow, syncFlow],
        reset: resetFlow,
    },
});
