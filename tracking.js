/** 
 * AURUM Funnel Tracking Script
 * Logs events instantly to Supabase for high-performance analytics.
 */
const SUPABASE_URL = 'https://cwdawyeiijbcoihobvpb.supabase.co/rest/v1/aurum_tracking';
const SUPABASE_KEY = 'sb_publishable_7mcxzRZkMjQcK1CTZjUl_w_AGm9kisr';

function trackEvent(page, event = 'View') {
  const ref = localStorage.getItem('aurum_ref') || '1W145K';
  const org = localStorage.getItem('aurum_org') || 'Direct';
  const platform = window.innerWidth < 768 ? 'Mobile' : 'Desktop';
  
  const payload = {
    event_type: event,
    page: page,
    ref: ref,
    org: org,
    platform: platform
  };

  console.log(`[AURUM-TRACKER] Firing ${event} on ${page} for ${ref}...`);

  fetch(SUPABASE_URL, { 
    method: 'POST', 
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload),
    keepalive: true 
  }).then(() => {
    console.log('[AURUM-TRACKER] Ping synced to Supabase.');
  }).catch(e => {
    console.warn('[AURUM-TRACKER] Supabase ping failed:', e);
  });
}

// Automatically track the 'View' event when this script is loaded on a page
window.addEventListener('DOMContentLoaded', () => {
  const pageMap = {
    'index.html': 'Lander',
    'offer.html': 'Offer',
    'onboarding.html': 'Onboarding'
  };
  
  // Clean page name from URL path
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const pageName = pageMap[path] || 'Other';
  
  trackEvent(pageName, 'View');

  // If we're on the onboarding page, hook the final signup button
  if (path === 'onboarding.html') {
    const signupBtn = document.getElementById('dynamic-join-btn');
    if (signupBtn) {
      signupBtn.addEventListener('click', () => {
        trackEvent('Onboarding', 'Signup Click');
      });
    }
  }
});
