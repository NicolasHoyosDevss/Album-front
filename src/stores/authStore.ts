import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../services/supabase';

export interface AuthStoreState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
  initialize: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStoreState>()((set) => ({
  session: null,
  user: null,
  loading: false,
  hydrated: false,
  error: null,

  initialize: () => {
    set({ loading: true, error: null });

    if (!isSupabaseConfigured) {
      set({
        loading: false,
        hydrated: true,
        error: 'Supabase is not configured.',
      });
      return () => undefined;
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        set({
          session: null,
          user: null,
          loading: false,
          hydrated: true,
          error: error.message,
        });
        return;
      }

      set({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
        hydrated: true,
        error: null,
      });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        hydrated: true,
        error: null,
      });
    });

    return () => data.subscription.unsubscribe();
  },

  signInWithGoogle: async () => {
    if (!isSupabaseConfigured) {
      set({ error: 'Supabase is not configured.' });
      return;
    }

    set({ loading: true, error: null });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      set({ loading: false, error: error.message });
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signOut();

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }

    set({
      session: null,
      user: null,
      loading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
