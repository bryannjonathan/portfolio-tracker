import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from '../context/AuthContext';
import { QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient();

const _layout = () => {
  return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
    </QueryClientProvider>
  )
}

const MainLayout = () => {
  const { user } = useAuth();
  
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }} 
      >
        {!user ? (
          <>
            <Stack.Screen name="(screens)/login" />
            <Stack.Screen name="(screens)/register" />
          </>
        ) : (
          <>
            <Stack.Screen name="(screens)/home" />
          </>
        )}

      </Stack>
    </SafeAreaProvider>
  )
}

export default _layout;
