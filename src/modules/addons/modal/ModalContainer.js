import { connect } from '@cerebral/react';
import { state } from 'cerebral/tags';
import React from 'react';
import ModalComponent from './ModalComponent';
import ModalLoading from './ModalLoading';
import { modalFeedback } from './ModalModule';
import propTypes from 'prop-types';

class ModalContainer extends React.Component {
    static propTypes = {
        items: propTypes.array,
        loading: propTypes.object,
    };
    renderList = () => {
        if (this.props.items.length > 0) {
            const data = this.props.items[this.props.items.length - 1];
            return (
                <ModalComponent
                    onButtonClick={path => {
                        modalFeedback(data.id, path.path);
                    }}
                    content={data.content}
                    theme={data.theme}
                    buttons={data.paths}
                    title={data.title}
                    html={data.html}
                    key={data.id}
                />
            );
        }
    };

    render() {
        let hasLoading = false;
        let loadingNames = [];
        for (var loadingKey in this.props.loading) {
            if (this.props.loading[loadingKey]) {
                hasLoading = true;
                loadingNames.push(loadingKey);
            }
        }
        return [
            this.renderList(),
            <ModalLoading
                key="loading"
                title={hasLoading && this.props.loading[loadingNames[0]].title}
                info={loadingNames.join(',')}
                visible={hasLoading}
            />,
        ];
    }
}

export default connect({ items: state`modal.list`, loading: state`modal.loading` }, ModalContainer);
