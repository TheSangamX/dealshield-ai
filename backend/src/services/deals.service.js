import { supabaseAdmin } from '../config/supabase.js';

const HISTORY_LIMIT = 20;
const LIST_COLUMNS = 'id, subject, counterpart_name, counterpart_email, created_at';

// The counterpart is the most recent sender who isn't the signed-in user.
function findCounterpart(thread, userEmail) {
  const messages = thread?.messages ?? [];
  const fromOthers = messages.filter((m) => m.sender?.email && m.sender.email !== userEmail);
  const sender = (fromOthers.at(-1) ?? messages.at(-1))?.sender;
  return { name: sender?.name || null, email: sender?.email || null };
}

/** Saves an analysis to the user's history. The email body is not stored. Returns the new id. */
export async function saveAnalysis({ user, thread, result }) {
  const counterpart = findCounterpart(thread, user.email);
  const { data, error } = await supabaseAdmin
    .from('analyses')
    .insert({
      user_id: user.id,
      subject: thread?.subject || null,
      counterpart_name: counterpart.name,
      counterpart_email: counterpart.email,
      result,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function listAnalyses(userId) {
  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select(LIST_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);
  if (error) throw error;
  return data;
}

export async function getAnalysis(userId, id) {
  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select(`${LIST_COLUMNS}, result`)
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Returns true when a row was deleted.
export async function deleteAnalysis(userId, id) {
  const { data, error } = await supabaseAdmin
    .from('analyses')
    .delete()
    .eq('user_id', userId)
    .eq('id', id)
    .select('id');
  if (error) throw error;
  return data.length > 0;
}
