import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables (standard Vite env vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock-instance.supabase.co', 'mock-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

// Fallback Local Storage Helper for seamless demo/testing without credentials
export const LOCAL_STORAGE_KEYS = {
  CURRENT_USER: 'save_app_current_user',
  USERS: 'save_app_users',
  WORKSPACES: 'save_app_workspaces',
  MEMBERS: 'save_app_members',
  CATEGORIES: 'save_app_categories',
  TRANSACTIONS: 'save_app_transactions',
  EMAIL_LOGS: 'save_app_email_logs',
};
