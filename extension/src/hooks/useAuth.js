import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  // Both resolve to { error } (null on success) so forms can show the message.
  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  // needsConfirmation: Supabase's "Confirm email" setting is on, so no session yet.
  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { error, needsConfirmation: !error && !data.session };
  }, []);

  const signOut = useCallback(() => supabase?.auth.signOut(), []);

  return {
    session,
    user: session?.user ?? null,
    loading,
    isConfigured: Boolean(supabase),
    signIn,
    signUp,
    signOut,
  };
}
