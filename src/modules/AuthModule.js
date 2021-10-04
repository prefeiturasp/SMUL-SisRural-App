import { Module } from 'cerebral';
import { when } from 'cerebral/operators';
import { props as Props, state } from 'cerebral/tags';
import { ActionRoute } from '../components/';
import { modal } from './addons';
import { existStoredToken, getDeviceToken, getToken, logout, redirectUser, setUser } from './auth';
import { flowRunMigrations, syncFlow } from './DBModule';
import { offlineCheckFlow } from './OfflineModule';
import { APIResponse, get } from './services';

const logoutFlow = [
    when(state`offline.isOnline`),
    {
        true: [getDeviceToken, prepareLogout, ...get('/auth/logout', 'auth.requestLogout', Props`variables`)],
        false: [],
    },

    logout,
    ({ db }) => {
        return db.dropDB();
    },
];

export default Module({
    state: {
        token: null,
        user: null,

        requestVerify: APIResponse(),
        requestLogout: APIResponse(),
    },
    signals: {
        logoutSilent: [...offlineCheckFlow, ...logoutFlow],

        logout: [
            ...offlineCheckFlow,
            getPendingRecordCount,
            {
                cancel: [],
                logout: logoutFlow,
            },
        ],
    },
});

export const flowAuthUser = [setUser, ...flowRunMigrations, ...syncFlow, redirectUser, setStartApp];

export const flowInitAuthUser = [
    getDeviceToken,
    getToken,
    existStoredToken,
    {
        success: [
            ({ props }) => {
                props.response = {
                    result: {
                        access_token: props.storedToken,
                    },
                };
            },
            ...flowAuthUser,

            // //TODO fluxo para quadno tem conexão, ver se vai precisar, hoje passa
            // prepareVerify,
            // ...post('/auth/verify', 'auth.requestVerify', Props`variables`),
            // {
            //     success: [
            //         set(State`auth.requestVerify.loading`, true),
            //         ...flowAuthUser,
            //         set(State`auth.requestVerify.loading`, false),
            //     ],
            //     error: [
            //         () => {
            //             ActionRoute.go('/login');
            //         }
            //     ],
            // },
        ],
        error: [
            () => {
                ActionRoute.go('/login');
            },
        ],
    },
];

/*
function prepareVerify({ props }) {
    props.variables = {
        deviceOS: props.deviceOS,
        deviceToken: props.deviceToken,
    };
}
*/

function prepareLogout({ props }) {
    props.variables = {
        deviceToken: props.deviceToken,
        deviceOS: props.deviceOS,
    };
}

async function getPendingRecordCount(ctx) {
    const { db } = ctx;
    const [data] = await db.exec('select table_name from app_migrations where has_app_sync=:hasAppSync', [true]);

    let total = 0;
    for (const record of data.rows.raw()) {
        const [count] = await db.exec('select 1 from ' + record.table_name + ' where app_sync=:appSync', [true]);
        total += count.rows.length;
    }

    if (total > 0) {
        return modal(
            {
                title: 'Atenção',
                content:
                    'Você possui ' + total + ' registro(s) não sincronizados. Efetue a sincronização antes do logout.',
            },
            [{ path: 'cancel', label: 'Continuar' }]
        )(ctx);
    } else {
        return ctx.path.logout();
    }
}

function setStartApp({ props, state }) {
    state.set('app.logged', true);
}
