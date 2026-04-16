import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import LoginScreen from '../screens/LoginScreen';
import HouseholdListScreen from '../screens/HouseholdListScreen';
import MainNavigator from './MainNavigator';

export type RootStackParamList = {
  Login: undefined;
  HouseholdSetup: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { activeHousehold } = useHousehold();

  if (authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const needsHousehold = isAuthenticated && !activeHousehold;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : needsHousehold ? (
          <Stack.Screen
            name="HouseholdSetup"
            component={HouseholdListScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
});
