import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Create the Supabase client only if credentials are available
let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    "Supabase credentials not found. Online multiplayer will be disabled."
  );
}

export const supabase = supabaseInstance;

export const isSupabaseConfigured = (): boolean => {
  return supabaseInstance !== null;
};

// Type-safe helper to get the Supabase client (throws if not configured)
export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    throw new Error("Supabase is not configured");
  }
  return supabaseInstance;
};
