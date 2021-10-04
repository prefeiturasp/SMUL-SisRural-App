const debug = require('debug')('OfflineModule');

import NetInfo, { NetInfoCellularGeneration, NetInfoStateType } from '@react-native-community/netinfo';
import { Module } from 'cerebral';
import { hideLoading, showLoading } from './addons';
import {CellScanModule} from '@fbcmobile/signalscan';
import { PermissionsAndroid } from 'react-native';

NetInfo.configure({
    reachabilityUrl: 'https://sisrural.prefeitura.sp.gov.br/api/offline/health',
    reachabilityTest: async (response) => response.status === 200,
    reachabilityLongTimeout: 60 * 1000, // 60s
    reachabilityShortTimeout: 5 * 1000, // 5s
    reachabilityRequestTimeout: 3000, // 3s
});

export const offlineCheckFlow = [
    showLoading('offline.offlineCheck', 'Verificando conectividade'),
    async ({ state }) => {

        const netInfo = await NetInfo.fetch();
        const { isConnected, isInternetReachable, type, details } = netInfo;

        const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE, PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION], {
            title: 'Permissão para utilizar as informações do telefone',
            message: 'O aplicativo precisa de permissão para acessar as informações de conectividade do telefone para aprimorar a sincronização.',
            buttonNeutral: 'Mais tarde',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Permitir',
        });

        let connected = isConnected && isInternetReachable;
        
        if (
            type == NetInfoStateType.none ||
            (type == NetInfoStateType.cellular &&
                details &&
                details.cellularGeneration &&
                details.cellularGeneration == NetInfoCellularGeneration['2g'])
        ) {
            connected = false;
        } else if(type == NetInfoStateType.cellular) {
            if (granted[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] === PermissionsAndroid.RESULTS.GRANTED && 
                granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED) {
                const results = await CellScanModule.getCellScanResults();        

                if(results){
                    const keys = Object.keys(results);
                    if(keys.length > 0){
                        keys.forEach((k)=>{
                            // CUIDAR PARA NÃO TESTAR COM "MENOR" POIS 0 PODE INDICAR QUE O NÍVEL DE SINAL É DESCONHECIDO
                            if(results[k].signalLevel && results[k].signalLevel == 1){
                                connected = false;
                            }                            
                        })
                    }
                }
            }
        }

        state.set('offline.isOnline', connected);
    },
    hideLoading('offline.offlineCheck'),
];

export default Module({
    state: {
        isOnline: false,
    },
    signals: {
        offlineCheck: offlineCheckFlow,
    },
});
