import React from 'react';
import { Dimensions, View } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import { Text } from '../';
import styles from './TabViewMaterial.styles';

const initialLayout = { width: Dimensions.get('window').width };

const renderTabBar = props => {
    return (
        <TabBar
            scrollEnabled
            {...props}
            indicatorStyle={styles.TabIndicator}
            style={styles.Tab}
            tabStyle={styles.TabTab}
            onTabPress={({ route, preventDefault }) => {
                if (route.disabled) {
                    preventDefault();
                }
            }}
            renderLabel={({ route, focused, color }) => (
                <View style={styles.TabLabel__view}>
                    <Text
                        style={[
                            styles.TabLabel,
                            focused ? styles.TabLabel__focused : null,
                            route.disabled ? styles.TabLabel__disabled : null,
                        ]}
                    >
                        {route.title}
                    </Text>
                </View>
            )}
        />
    );
};

/**
 * Wrapper criado para normalizar o Layout do "TabBar"
 */
const TabViewMaterial = props => {
    return <TabView scrollEnabled={true} renderTabBar={renderTabBar} initialLayout={initialLayout} {...props} />;
};

export default TabViewMaterial;
