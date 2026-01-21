import type { StateCreator } from "zustand";
import type { GameStore } from "../types";
import { isSupabaseConfigured, getSupabase } from "../../lib/supabase";
import type { Profile } from "../../lib/database.types";
import type { User } from "@supabase/supabase-js";
import { normalizeError, logSupabaseError, getUserFriendlyMessage } from "../../lib/supabaseHelpers";

// ============================================
// AUTH STATE & ACTIONS
// ============================================

export interface AuthState {
  // User authentication
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
}

export interface AuthActions {
  // Auth methods
  initializeAuth: () => Promise<void>;
  signInAnonymously: (username: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, "username" | "display_name" | "avatar_url">>) => Promise<boolean>;
  clearAuthError: () => void;
}

// Initial auth state
export const initialAuthState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isAuthLoading: true,
  authError: null,
};

// ============================================
// CREATE AUTH SLICE
// ============================================

export const createAuthSlice: StateCreator<
  GameStore,
  [],
  [],
  AuthState & AuthActions
> = (set, get) => ({
  ...initialAuthState,

  // Initialize auth - check for existing session
  initializeAuth: async () => {
    if (!isSupabaseConfigured()) {
      set({ isAuthLoading: false });
      return;
    }

    const client = getSupabase();

    try {
      const { data: { session } } = await client.auth.getSession();

      if (session?.user) {
        // Fetch profile (use maybeSingle to handle case where profile doesn't exist yet)
        const { data: profile } = await client
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        set({
          user: session.user,
          profile: profile || null,
          isAuthenticated: true,
          isAuthLoading: false,
        });
      } else {
        set({ isAuthLoading: false });
      }

      // Listen for auth changes
      client.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const { data: profile } = await client
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          set({
            user: session.user,
            profile: profile || null,
            isAuthenticated: true,
          });
        } else if (event === "SIGNED_OUT") {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
          });
        }
      });
    } catch (error) {
      const normalizedError = normalizeError(error);
      logSupabaseError("initializeAuth", normalizedError);
      set({ isAuthLoading: false, authError: normalizedError.message });
    }
  },

  // Anonymous sign in
  signInAnonymously: async (username: string) => {
    if (!isSupabaseConfigured()) {
      set({ authError: "Supabase not configured" });
      return false;
    }

    const client = getSupabase();
    set({ isAuthLoading: true, authError: null });

    try {
      // Sign in anonymously
      const { data: authData, error: authError } = await client.auth.signInAnonymously();

      if (authError) {
        set({ authError: authError.message, isAuthLoading: false });
        return false;
      }

      if (!authData.user) {
        set({ authError: "Failed to create anonymous session", isAuthLoading: false });
        return false;
      }

      const userId = authData.user.id;
      const finalUsername = username.trim() || `Player_${userId.slice(0, 6)}`;

      // Create profile for anonymous user
      const { data: profile, error: profileError } = await client
        .from("profiles")
        .insert({
          id: userId,
          username: finalUsername,
          display_name: username.trim() || null,
        })
        .select()
        .single();

      if (profileError) {
        // Profile might already exist if user reconnects
        const { data: existingProfile } = await client
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (existingProfile) {
          set({
            user: authData.user,
            profile: existingProfile,
            isAuthenticated: true,
            isAuthLoading: false,
          });
          return true;
        }

        set({ authError: profileError.message, isAuthLoading: false });
        return false;
      }

      set({
        user: authData.user,
        profile: profile,
        isAuthenticated: true,
        isAuthLoading: false,
      });

      return true;
    } catch (error) {
      const normalizedError = normalizeError(error);
      logSupabaseError("signInAnonymously", normalizedError);
      set({ authError: getUserFriendlyMessage(normalizedError), isAuthLoading: false });
      return false;
    }
  },

  // Sign out
  signOut: async () => {
    if (!isSupabaseConfigured()) return;

    const client = getSupabase();

    try {
      await client.auth.signOut();
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        authError: null,
      });
    } catch (error) {
      const normalizedError = normalizeError(error);
      logSupabaseError("signOut", normalizedError);
    }
  },

  // Update profile
  updateProfile: async (updates) => {
    const { user } = get();
    if (!isSupabaseConfigured() || !user) return false;

    const client = getSupabase();

    try {
      const { data, error } = await client
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        set({ authError: error.message });
        return false;
      }

      set({ profile: data });
      return true;
    } catch (error) {
      const normalizedError = normalizeError(error);
      logSupabaseError("updateProfile", normalizedError);
      set({ authError: getUserFriendlyMessage(normalizedError) });
      return false;
    }
  },

  // Clear auth error
  clearAuthError: () => {
    set({ authError: null });
  },
});
