import React from 'react';

import { ActivityIndicator } from 'react-native';

import { Spacer } from '../';

export default function LoadingWhite() {
    return (
        <Spacer horizontal={2} vertical={2}>
            <ActivityIndicator size={'large'} color={'white'} />
        </Spacer>
    );
}
