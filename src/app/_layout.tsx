/**
 * RootLayout Component
 *
 * App-wide navigation shell:
 * - ThemeProvider: light/dark system color scheme synchronization
 * - Stack Navigator: headerless screen transitions
 * - StatusBar: dark icons on clean white surface
 */

import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, Pressable, Text, View, useColorScheme } from 'react-native';
import { ToastProvider } from '@/context/ToastContext';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [webMounted, setWebMounted] = useState(Platform.OS !== 'web');
  const [webAuth, setWebAuth] = useState<'checking' | 'signedIn' | 'signedOut' | 'error'>(
    Platform.OS === 'web' ? 'checking' : 'signedIn'
  );
  const [sessionCheck, setSessionCheck] = useState(0);
  useEffect(() => { setWebMounted(true); }, []);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let active = true;
    setWebAuth('checking');
    const timeout = setTimeout(() => {
      if (active) setWebAuth('error');
    }, 10000);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      clearTimeout(timeout);
      setWebAuth(session ? 'signedIn' : 'signedOut');
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      clearTimeout(timeout);
      setWebAuth(error ? 'error' : data.session ? 'signedIn' : 'signedOut');
    }).catch(() => {
      if (!active) return;
      clearTimeout(timeout);
      setWebAuth('error');
    });
    return () => { active = false; clearTimeout(timeout); subscription.unsubscribe(); };
  }, [sessionCheck]);

  return (
    <ThemeProvider value={webMounted && colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <View style={Platform.OS === 'web'
          ? { flex: 1, width: '100%', maxWidth: 800, alignSelf: 'center' }
          : { flex: 1 }}>
        {webMounted && webAuth !== 'checking' && webAuth !== 'error' ? <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
          <Stack.Protected guard={Platform.OS !== 'web' || webAuth === 'signedIn'}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="tools" options={{ headerShown: false, animation: 'slide_from_right' }} />
          </Stack.Protected>
        </Stack> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white }}>
          {webAuth === 'error' ? <>
            <Text style={{ color: Colors.iconDark }}>Could not check your session.</Text>
            <Pressable accessibilityRole="button" onPress={() => setSessionCheck(value => value + 1)} style={{ padding: 16 }}>
              <Text style={{ color: Colors.primary }}>Retry</Text>
            </Pressable>
          </> : <ActivityIndicator color={Colors.primary} />}
        </View>}
        </View>
        <StatusBar style="dark" />
      </ToastProvider>
    </ThemeProvider>
  );
}

