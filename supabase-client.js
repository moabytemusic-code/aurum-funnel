/**
 * AURUM Funnel - Supabase Client Setup
 * This file dynamically initializes the Supabase client.
 */
const SUPABASE_URL = window.AURUM_CONFIG?.SUPABASE_URL || 'https://cwdawyeiijbcoihobvpb.supabase.co';
const SUPABASE_ANON_KEY = window.AURUM_CONFIG?.SUPABASE_ANON_KEY || 'sb_publishable_7mcxzRZkMjQcK1CTZjUl_w_AGm9kisr';

// Global function to (re)initialize the client with a specific key
window.initAurumClient = (key) => {
  if (typeof supabase !== 'undefined' && SUPABASE_URL && key) {
    window.aurumDB = supabase.createClient(SUPABASE_URL, key);
    console.log(`[AURUM-DB] Supabase Client Initialized with ${key.startsWith('sb_publishable') ? 'Anon' : 'Privileged'} Key.`);
    return true;
  }
  return false;
};

// Initial Setup
const sessionKey = sessionStorage.getItem('AURUM_MASTER_KEY') || localStorage.getItem('AURUM_MASTER_KEY');
if (!window.initAurumClient(sessionKey || SUPABASE_ANON_KEY)) {
  window.aurumDB = null;
  console.log('[AURUM-DB] Initialization failed. Check keys or network.');
}
