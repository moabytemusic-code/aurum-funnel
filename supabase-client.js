/**
 * AURUM Funnel - Supabase Client Setup
 * This file dynamically initializes the Supabase client based on testing keys
 */
const SUPABASE_URL = window.AURUM_CONFIG?.SUPABASE_URL || 'https://cwdawyeiijbcoihobvpb.supabase.co';
const SUPABASE_ANON_KEY = window.AURUM_CONFIG?.SUPABASE_ANON_KEY || 'sb_publishable_7mcxzRZkMjQcK1CTZjUl_w_AGm9kisr';

// Make Supabase DB globally accessible if loaded
if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
  window.aurumDB = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('[AURUM-DB] Embedded Supabase Client Initialized.');
} else {
  // Graceful fallback for the prototype
  window.aurumDB = null;
  console.log('[AURUM-DB] Running entirely off local storage fallback.');
}
