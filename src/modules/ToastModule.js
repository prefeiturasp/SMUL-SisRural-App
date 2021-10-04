import { Module } from 'cerebral';
import { wait } from 'cerebral/operators';
import { props as Props } from 'cerebral/tags';

let cursor = 0;

export default Module({
    state: {
        list: [],
    },
    signals: {
        removeToast: [
            ({ state, props }) => {
                state.set('toast.list', getToastList(state.get('toast.list'), props.id, false));
            },
            wait(800),
            ({ state, props }) => {
                const list = state.get('toast.list').filter(item => item.id !== props.id);
                state.set('toast.list', list);
            },
        ],
    },
});

export function toastErrorRequest(opts) {
    return [
        ({ state, props }) => {
            try {
                const data = state.get(opts.path);
                let { message } = data.result;

                if (!message) {
                    message = data.result;
                }
                props.variables = { text: message, type: 'warning' };
            } catch (e) {
                props.variables = {
                    text: 'Não foi possível conectar com o servidor, tente novamente.',
                    type: 'warning',
                };
            }
        },

        toast(Props`variables`),
    ];
}

export function toast(opts) {
    return [
        function(ctx) {
            const vars = ctx.resolve.value(opts);

            const id = ++cursor;

            ctx.props.id = id;

            ctx.state.push('toast.list', {
                id: id,
                visible: false,
                type: vars.type,
                text: ctx.resolve.value(vars.text),
            });
        },
        wait(10),
        function({ props, state }) {
            state.set('toast.list', getToastList(state.get('toast.list'), props.id, true));
        },
        wait(6000),
        function({ state, props }) {
            state.set('toast.list', getToastList(state.get('toast.list'), props.id, false));
        },
        wait(400),
        function({ state, props }) {
            const list = state.get('toast.list').filter(item => item.id !== props.id);
            state.set('toast.list', list);
        },
    ];
}

function getToastList(list, id, visible) {
    return list.map(v => {
        if (v.id === id) {
            v.visible = visible;
        }

        return v;
    });
}
