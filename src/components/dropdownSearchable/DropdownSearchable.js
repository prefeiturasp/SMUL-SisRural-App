import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { Spacer, Touchable } from '..';
import { removeAccents } from '../../utils/StringUtil';
import Separator from '../separator/Separator';
import Text from '../text/Text';
import TextInputMaterial from '../textInputMaterial/TextInputMaterial';
import styles from './DropdownSearchable.styles';

class DropdownSearchable extends React.Component {
    fieldRef = React.createRef();
    flatlistRef = React.createRef();

    static defaultProps = {
        disabled: false,
        loading: false,
    };

    static propTypes = {
        label: PropTypes.string,

        data: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.any,
                nome: PropTypes.any,
            })
        ),
        value: PropTypes.any, //Value array de ids por causa do ComponentArrayConnect

        disabled: PropTypes.bool,
        loading: PropTypes.bool,
        error: PropTypes.bool,

        refScrollview: PropTypes.any,
    };

    constructor(props) {
        super(props);

        this.state = { text: '' };
    }

    componentDidMount() {
        this.setCurrentTextValue(this.props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setCurrentTextValue(nextProps);
    }

    setCurrentTextValue = props => {
        const { data } = this.props;
        const list = data.filter(v => v.id === props.value);

        //Atualiza o textinput com o valor correto (que vem do Value)
        if (list.length === 1) {
            this.setState({ text: list[0].nome });
        } else {
            this.setState({ text: '' });
        }
    };

    setValueOnBlur = () => {
        const { data } = this.props;
        const { text } = this.state;

        const textNoAccents = removeAccents(text).toLowerCase();

        const list = data.filter(
            v =>
                removeAccents(v.nome)
                    .toLowerCase()
                    .indexOf(textNoAccents) > -1
        );

        if (list.length > 0) {
            const selectedItem = list[0];

            if (this.props.value !== selectedItem.id) {
                this.props.onChangeText(selectedItem.id);
            }
        } else {
            //Força selecionar novamente o texto do valor selecionado
            this.setCurrentTextValue(this.props);
        }
    };

    onChangeText = text => {
        this.setState({ text });
    };

    onFocus = () => {
        this.setState({ focused: true }, () => {
            if (this.props.onFocus) {
                this.props.onFocus();
            }
        });
    };

    onBlur = () => {
        this.setState({ focused: false }, () => {
            this.setValueOnBlur();
        });
    };

    keyExtractor = (item, index) => {
        return index.toString();
    };

    onItemPress = item => {
        this.setState({ text: item.nome }, () => {
            this.forceBlur();
        });
    };

    forceBlur = () => {
        let { current: field } = this.fieldRef;

        field.blur();
    };

    renderItem = ({ item, index }) => {
        return (
            <Touchable onPress={this.onItemPress.bind(this, item)}>
                <Spacer vertical={2}>
                    <Text>{item.nome}</Text>
                </Spacer>
            </Touchable>
        );
    };

    renderEmpty = () => {
        return (
            <Spacer>
                <Text>Nenhum registro foi encontrado.</Text>
            </Spacer>
        );
    };

    renderSeparator = () => {
        return <Separator />;
    };

    getFilteredData = () => {
        const { text } = this.state;
        const textNoAccents = removeAccents(text).toLowerCase();

        const { data } = this.props;

        const list = data
            .filter(
                v =>
                    removeAccents(v.nome)
                        .toLowerCase()
                        .indexOf(textNoAccents) === 0
            )
            .splice(0, 10);

        return list;
    };

    render() {
        const { label, disabled, loading, error } = this.props;

        let containerStyle = { opacity: disabled ? 0.3 : 1 };

        return (
            <View ref={this.flatlistRef} style={[styles.root, containerStyle]}>
                {loading && <ActivityIndicator size="small" style={styles.loading} />}

                <View>
                    <TextInputMaterial
                        customRef={this.fieldRef}
                        label={label}
                        value={this.state.text}
                        onChangeText={this.onChangeText}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        error={error}
                    />
                </View>

                {this.state.focused && (
                    <FlatList
                        data={this.getFilteredData()}
                        contentContainerStyle={styles.scrollview}
                        renderItem={this.renderItem}
                        keyExtractor={this.keyExtractor}
                        ListEmptyComponent={this.renderEmpty}
                        ListHeaderComponent={this.renderHeader}
                        ItemSeparatorComponent={this.renderSeparator}
                        keyboardShouldPersistTaps={'always'}
                    />
                )}
            </View>
        );
    }
}

export default DropdownSearchable;
