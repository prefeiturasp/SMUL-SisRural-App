import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { View } from 'react-native';
import { Loading, Separator, Spacer, CollapsibleContent, Text, ViewSmart, QueryDb } from '../../../components';
import styles from './AnaliseChecklist.styles';

const QUERY = `
    SELECT CAPL.message, 
           CAPL.status, 
           CAPL.created_at,
           U.first_name user
      FROM checklist_aprovacao_logs CAPL,
           users U
     WHERE CAPL.checklist_unidade_produtiva_id = :id
       AND U.id = user_id`;

const STATUS_LABEL = {
    aguardando_revisao: 'Aguardando revisão',
    aprovado: 'Aprovado',
    reprovado: 'Aguardando revisão',
};

class AnaliseChecklist extends React.Component {
    static propTypes = { checklistUnidadeProdutivaId: PropTypes.string };

    renderLog(log, index) {
        const date = moment(log.created_at).format('DD/MM/YYYY HH:mm');

        return (
            <React.Fragment key={index}>
                <Spacer horizontal={2} top={index == 0 ? 0 : 2} bottom={2}>
                    <ViewSmart row spaceBetween>
                        <ViewSmart row>
                            <Text size14 fontBold slateGrey>
                                {'Data  '}
                            </Text>
                            <Text size14 slateGrey>
                                {date}
                            </Text>
                        </ViewSmart>
                        <ViewSmart row>
                            <Text size14 fontBold slateGrey>
                                {'Status  '}
                            </Text>

                            <Text size14 slateGrey>
                                {log.status ? STATUS_LABEL[log.status] : 'Aguardando Aprovação'}
                            </Text>
                        </ViewSmart>
                    </ViewSmart>
                    <Spacer />

                    <Text size14 fontBold slateGrey>
                        Observação
                    </Text>
                    <Text size16 slateGrey>
                        {log.message}
                    </Text>
                    <Spacer />

                    <ViewSmart row>
                        <Text size14 fontBold slateGrey>
                            {'Usuário  '}
                        </Text>
                        <Text size14 slateGrey>
                            {log.user}
                        </Text>
                    </ViewSmart>
                </Spacer>
                <Separator />
            </React.Fragment>
        );
    }

    render() {
        const { checklistUnidadeProdutivaId } = this.props;
        return (
            <QueryDb query={QUERY} params={[checklistUnidadeProdutivaId]}>
                {data => {
                    if (!data || data.length == 0) {
                        return null;
                    }

                    return (
                        <View style={styles.box}>
                            <CollapsibleContent
                                header={<Text size16>Análise</Text>}
                                icons={{
                                    collapsed: 'materialicons@arrow-drop-down',
                                    notCollapsed: 'materialicons@arrow-drop-up',
                                }}
                            >
                                {data.map((log, i) => this.renderLog(log, i))}
                            </CollapsibleContent>
                        </View>
                    );
                }}
            </QueryDb>
        );
    }
}

export default AnaliseChecklist;
