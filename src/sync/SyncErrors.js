import { CerebralError } from 'cerebral';
import { props } from 'cerebral/tags';
import { ActionRoute } from '../components';
import { modal } from '../modules/addons';
import { hideAllLoading } from '../modules/addons/modal/ModalModule';

export class DownloadError extends CerebralError {
    constructor(error) {
        super(error.message);
    }
}

export class SyncError extends CerebralError {
    constructor(error) {
        super(error.message);
    }
}

export const syncErrorFlow = [
    hideAllLoading(),
    modal(
        {
            title: 'Alerta ao Sincronizar',
            content: props`error.message`,
        },
        [{ path: 'ok', label: 'Continuar' }]
    ),
    {
        ok: [
            () => {
                ActionRoute.go('/syncError');
            },
        ],
    },
];

export const downloadErrorFlow = [
    hideAllLoading(),
    modal(
        {
            title: 'Erro ao efetuar Download',
            content: props`error.message`,
        },
        [{ path: 'ok', label: 'Continuar' }]
    ),
    {
        ok: [
            () => {
                ActionRoute.go('/syncError');
            },
        ],
    },
];
