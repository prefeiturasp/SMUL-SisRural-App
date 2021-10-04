import { Module } from 'cerebral';

let cursor = 0;

const promises = {};

export function modalFeedback(id, path = null) {
    let p = promises[id];

    let list = p.ctx.state.get('modal.list');

    list = list.filter(item => item.id != id);

    p.ctx.state.set('modal.list', list);

    if (path) {
        if (p.inline) {
            p.resolve(path);
        } else {
            p.resolve(p.ctx.path[path]());
        }
    } else {
        p.resolve();
    }
    delete promises[id];
}

export function showLoading(id, title = null) {
    return function(ctx) {
        let loading = ctx.state.get('modal.loading');
        loading = { ...loading };
        loading[id] = { title: title };
        ctx.state.set('modal.loading', loading);
    };
}

export function hideLoading(id) {
    return function(ctx) {
        let loading = ctx.state.get('modal.loading');
        loading = { ...loading };
        // noinspection JSAnnotator
        if (loading[id]) {
            delete loading[id];
            ctx.state.set('modal.loading', loading);
        }
    };
}
export function hideAllLoading() {
    return function(ctx) {
        // noinspection JSAnnotator
        ctx.state.set('modal.loading', {});
    };
}

export function modal(opts, paths = [], uid = null) {
    if (typeof opts == 'string') {
        opts = { title: opts };
    }
    //Modal ID
    return function(ctx, inline = false) {
        const title = ctx.resolve.value(typeof opts == 'string' ? opts : opts.title);
        const content = ctx.resolve.value(typeof opts == 'string' ? opts : opts.content);

        const html = ctx.resolve.value(typeof opts == 'string' ? null : opts.html);

        const id = uid || ++cursor;
        ctx.state.push('modal.list', {
            id,
            title,
            html,
            paths,
            content,
        });
        //se tem paths para aguardar..

        const promise = new Promise((resolve, reject) => {
            promises[id] = { resolve, reject, ctx, inline };

            if (!paths || paths.length == 0) {
                setTimeout(
                    () => {
                        modalFeedback(id);
                    },
                    opts.time ? opts.time * 1 : 4000
                );
            }
        });
        return promise;
    };
}

export default Module({
    state: {
        list: [],
        loading: {},
    },
});
