import { supabaseAdmin } from '../config/supabase.js';

const startOfMonthUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
};

export async function countUsageThisMonth(userId, action = 'analyze') {
  const { count, error } = await supabaseAdmin
    .from('usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', startOfMonthUtc());
  if (error) throw error;
  return count ?? 0;
}

export async function recordUsage(userId, action = 'analyze') {
  const { error } = await supabaseAdmin.from('usage_events').insert({ user_id: userId, action });
  if (error) throw error;
}
