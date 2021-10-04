import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
    root: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,

        padding: 15,
    },
});

function LoadingMore(props) {
    return (
        <View style={styles.root}>
            <ActivityIndicator size={'large'} color={props.color} />
        </View>
    );
}

LoadingMore.propTypes = {
    color: PropTypes.string,
};

LoadingMore.defaultProps = {
    color: 'black',
};

export default LoadingMore;
