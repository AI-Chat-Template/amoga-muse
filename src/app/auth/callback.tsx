import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    async function finishSignIn() {
      try {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.hash.slice(1));
        const authError = params.get('error_description') || url.searchParams.get('error_description');
        if (authError) throw new Error(authError);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const code = url.searchParams.get('code');
        window.history.replaceState({}, '', url.pathname);
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!data.user?.email) throw new Error('Sign-in did not return a user. Please try again.');
        const { error: profileError } = await supabase.from('users').upsert({
          email: data.user.email,
          name: data.user.user_metadata.name || '',
        }, { onConflict: 'email' });
        if (profileError) throw profileError;
        router.replace('/(tabs)/chat');
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Sign-in failed.');
      }
    }
    void finishSignIn();
  }, [router]);

  if (Platform.OS !== 'web') return <Redirect href="/" />;
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white }}>
    {error ? <Text>{error}</Text> : <ActivityIndicator color={Colors.primary} />}
  </View>;
}
