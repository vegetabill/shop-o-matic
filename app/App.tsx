import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { HouseholdProvider } from './src/context/HouseholdContext';
import AppNavigator from './src/navigation/AppNavigator';
import ApiErrorToast, { ApiErrorToastHandle } from './src/components/ApiErrorToast';
import { setOnApiErrorCallback } from './src/api/client';

export default function App() {
  const toastRef = useRef<ApiErrorToastHandle>(null);

  useEffect(() => {
    setOnApiErrorCallback((method, url, status, body) => {
      toastRef.current?.show(method, url, status, body);
    });
  }, []);

  return (
    <AuthProvider>
      <HouseholdProvider>
        <View style={styles.root}>
          <StatusBar style="auto" />
          <AppNavigator />
          <ApiErrorToast ref={toastRef} />
        </View>
      </HouseholdProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
