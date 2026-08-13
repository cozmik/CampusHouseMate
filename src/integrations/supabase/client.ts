import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Vite inlines VITE_* at build time. Server runtime env is ignored unless
// these were present when `vite build` ran (then redeploy).
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://mdewakadxwgxigijmcxe.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZXdha2FkeHdneGlnaWptY3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NjQyMzQsImV4cCI6MjEwMTM0MDIzNH0.XWh9QwMbkSaOhXXrEtoJ6liKIhUjdB-hfp-IeJ2XAyM";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
