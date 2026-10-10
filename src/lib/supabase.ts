import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';
const isWebServer = Platform.OS === 'web' && typeof window === 'undefined';

/**
 * Check if Supabase environment configuration is set up.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
);

/**
 * Single Supabase client instance for interacting with database and authentication.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: isWebServer ? undefined : AsyncStorage,
      persistSession: !isWebServer,
      autoRefreshToken: !isWebServer,
      detectSessionInUrl: false,
    },
  }
);
