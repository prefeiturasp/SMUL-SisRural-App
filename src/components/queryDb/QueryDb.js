import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Button, Dialog, Paragraph, Portal } from 'react-native-paper';
import DBProvider from '../../modules/providers/DBProvider';
import Loading from '../loading/Loading';

class QueryDb extends React.Component {
    static propTypes = {
        query: PropTypes.string,
        params: PropTypes.any,
        returnFirst: PropTypes.bool,
        onComplete: PropTypes.func,
        onFirstComplete: PropTypes.func,
        supressError: PropTypes.bool,
    };

    static defaultProps = {
        params: [],
        returnFirst: false,
    };

    constructor(props) {
        super(props);

        this.fetchMore = this.fetchMore.bind(this);

        this.state = {
            loading: true,
            data: null,
            offset: 0,
            error: null,
            flFirstComplete: false,
            loadingMore: false,
            flLoadingMore: true,
        };
    }

    componentDidMount() {
        this.fetch();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.query !== prevState.query || nextProps.params !== prevState.params) {
            return { query: nextProps.query, params: nextProps.params, offset: 0, flLoadingMore: true };
        }

        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.query !== this.props.query || !_.isEqual(prevProps.params, this.props.params)) {
            this.fetch();
        }
    }

    async fetch() {
        const { flFirstComplete } = this.state;

        const { query, params } = this.props;
        if (!query) {
            throw new Error('Você precisa informar uma query para executar');
        }

        try {
            const [data] = await DBProvider.exec(query, params);
            this.setState({ data: data && data.rows ? data.rows.raw() : null, loading: false, flFirstComplete: true });
        } catch (e) {
            console.error(e);
            this.setState({ error: this.props.supressError ? null : e, loading: false, flFirstComplete: true });
        }

        if (this.props.onComplete) {
            this.props.onComplete();
        }

        if (this.props.onFirstComplete && !flFirstComplete) {
            this.props.onFirstComplete();
        }
    }

    onErrorDonePress = () => {
        this.setState({ error: null });
    };

    renderError = () => {
        const { error } = this.state;

        return (
            <Portal>
                <Dialog visible={true} onDismiss={this.onErrorDonePress}>
                    <Dialog.Title>Error</Dialog.Title>

                    <Dialog.Content>
                        <Paragraph>{error.message}</Paragraph>
                    </Dialog.Content>

                    <Dialog.Actions>
                        <Button onPress={this.onErrorDonePress}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        );
    };

    async fetchMore() {
        const { query, params } = this.props;
        if (!this.props.limit) {
            throw new Error('Você precisa informar um "limit" para executar essa operação');
        }

        if (!this.state.flLoadingMore) {
            return;
        }

        try {
            const offset = this.state.offset + 1 * this.props.limit;

            this.setState({ offset, loadingMore: true });

            const [data] = await DBProvider.exec(query + ' OFFSET ' + offset, params);

            const oldData = this.state.data ? this.state.data : [];
            const newData = data.rows.raw();

            this.setState({
                data: oldData.concat(newData ? newData : []),
                loadingMore: false,
                flLoadingMore: newData.length >= this.props.limit,
            });
        } catch (e) {
            console.error(e);
        }
    }

    render() {
        const { data, error, loading, loadingMore } = this.state;
        const { returnFirst } = this.props;

        if (loading) {
            return <Loading />;
        }

        if (error) {
            return this.renderError();
        }

        if (returnFirst) {
            return this.props.children(data ? data[0] : null, null, null);
        } else {
            return this.props.children(data ? data : [], this.fetchMore, loadingMore);
        }
    }
}

export default QueryDb;
