import { connect } from '@cerebral/react';
import { signal, state } from 'cerebral/tags';
import React, { useEffect, useState } from 'react';
import { PermissionsAndroid } from 'react-native';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import { Button, Spacer } from '../';

const ShareDownloadablePdfButton = ({ url, pdfFileName, isOnline, signalOfflineCheck }) => {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        signalOfflineCheck();
    }, []);

    const onShare = async () => {
        const hasPermission = await requestPermission();

        if (hasPermission) {
            setLoading(true);

            try {
                let dirs = RNFetchBlob.fs.dirs;
                await RNFetchBlob.config({
                    path: dirs.DocumentDir + '/' + pdfFileName,
                })
                    .fetch('GET', url, {})
                    .then(async res => {
                        Share.open({
                            url: `file://${res.path()}`,
                        });
                        setLoading(false);
                    });
            } catch (e) {
            }

            setLoading(false);
        }
    };

    const requestPermission = async () => {
        try {
            const granted = await PermissionsAndroid.requestMultiple(
                [
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                ],
                {
                    title: 'Permissão para armazenamento',
                    message: 'O aplicativo precisa de permissão para armazenar o arquivo de checklist',
                    buttonNeutral: 'Mais tarde',
                    buttonNegative: 'Cancelar',
                    buttonPositive: 'Permitir',
                }
            );

            if (
                granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
                granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED
            ) {
                return true;
            }
        } catch (err) {
            console.warn(err);
        }
        return false;
    };

    if (!isOnline) {
        return null;
    }

    return (
        <>
            <Button mode="contained" onPress={onShare} loading={loading}>
                COMPARTILHAR
            </Button>
            <Spacer />
        </>
    );
};

export default connect(
    {
        isOnline: state`offline.isOnline`,
        signalOfflineCheck: signal`offline.offlineCheck`,
    },
    ShareDownloadablePdfButton
);
