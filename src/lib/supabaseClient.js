import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    enabled: true,
    params: {
      eventsPerSecond: 10
    },
    timeout: 60000, // 60 seconds timeout
    heartbeat: {
      interval: 5000, // Send heartbeat every 5 seconds
      maxRetries: 5
    }
  }
});