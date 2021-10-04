import { Module } from 'cerebral';
import { getRepository } from 'typeorm/browser';
import ChecklistUnidadeProdutiva from '../../db/typeORM/ChecklistUnidadeProdutivaModel';
import { syncFlow } from '../../modules/DBModule';

const clearGarbage = [
    async () => {
        const repo = getRepository(ChecklistUnidadeProdutiva);
        await repo.delete({
            app_sync: 0,
            created_at: null,
        });
    },
];

export default Module({
    state: {},
    signals: {
        pageLoad: [
            ({ props }) => {
                props.forceOfflineCheck = true;
            },
            ...syncFlow,
            ...clearGarbage,
        ],
    },
});
