/**
 * AURUM Funnel Dynamic Skinning
 * Swaps logos, colors, and content based on organization ID.
 */
(function() {
  // 1. Capture and Persist Org/Ref
  const urlParams = new URLSearchParams(window.location.search);
  const urlOrg = urlParams.get('org');
  const urlRef = urlParams.get('ref') || urlParams.get('user');

  // Priority: URL Param > LocalStorage > Default
  const org = urlOrg || localStorage.getItem('aurum_org') || 'Direct';
  let ref = urlRef || localStorage.getItem('aurum_ref') || '1W145K';
  
  // Persist back to storage
  localStorage.setItem('aurum_org', org);
  localStorage.setItem('aurum_ref', ref);

  // 2. Definition of Rich Skins
  const skins = {
    'ALPHA': {
      brand: 'ALPHA<span>FINANCE</span>',
      color: '#7C3AED', // Premium Violet
      gradient: 'linear-gradient(135deg, #7C3AED, #9333EA)',
      h1: 'The Alpha Digital Banking Strategy',
      sub: 'Leverage the Alpha Digital Banking Ecosystem to automate your digital assets with institutional-grade AI.',
      videoId: 'hep0eYXJY8c' // Can swap video per org if needed
    },
    'WEALTH': {
      brand: 'WEALTH<span>ADVISORS</span>',
      color: '#059669', // Emerald Green
      gradient: 'linear-gradient(135deg, #059669, #10B981)',
      h1: 'Wealth Generation via AI Automation',
      sub: 'Join the Wealth Advisors network and explore the AURUM automated digital banking suite.',
      videoId: 'hep0eYXJY8c'
    },
    'GOLD': {
      brand: 'GOLD<span>STANDARD</span>',
      color: '#D4AF37', // Gold
      gradient: 'linear-gradient(135deg, #D4AF37, #FFD700)',
      h1: 'The Gold Standard of AI Finance',
      sub: 'Secure your financial future with AURUM\'s world-class AI liquidity bots.',
      videoId: 'hep0eYXJY8c'
    },
    'DIRECT': {
      brand: 'THE AI<span> FINANCE </span>BREAKDOWN',
      color: '#0073FF',
      gradient: 'linear-gradient(135deg, #0073FF, #3898F8)',
      h1: 'The AI Finance Breakdown: Digital Banking Ecosystem',
      sub: 'Explore the AURUM digital banking ecosystem and automate your digital assets with institutional-grade AI.',
      videoId: 'hep0eYXJY8c'
    }
  };

  // Merge in dynamic skins from Admin Dashboard prototype (saved in localStorage)
  try {
    const savedOrgs = JSON.parse(localStorage.getItem('aurum_orgs_config'));
    if (savedOrgs && Array.isArray(savedOrgs)) {
      savedOrgs.forEach(o => {
        skins[o.code.toUpperCase()] = {
          brand: o.brand,
          color: o.color,
          gradient: `linear-gradient(135deg, ${o.color}, #555)`,
          h1: o.h1,
          sub: o.sub || 'Secure your financial future with AURUM\'s world-class AI liquidity bots.',
          videoId: 'hep0eYXJY8c'
        };
      });
    }
  } catch(e) {}

  document.addEventListener('DOMContentLoaded', async () => {
    console.log(`[AURUM-SKIN] Applying skin for ${org}...`);

    let activeSkin = skins[org.toUpperCase()];

    // Async Fetch from Supabase
    try {
      if (!window.supabase) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      const SUPABASE_URL = 'https://cwdawyeiijbcoihobvpb.supabase.co';
      const SUPABASE_ANON_KEY = 'sb_publishable_7mcxzRZkMjQcK1CTZjUl_w_AGm9kisr';
      const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      // --- AFFILIATE SECURITY & ROTATOR LOGIC ---
      try {
        const { data: affData, error: affErr } = await supabase
          .from('aurum_affiliates')
          .select('is_rotator, rotator_pool, rotator_index, status, brand_name, hero_title, hero_subtitle, hero_video')
          .eq('affiliate_code', ref)
          .single();
          
        if (affErr || !affData) {
            // ROGUE DEFENSE: If they try to fake a code that doesn't exist, override to Admin.
            console.warn('[AURUM-SECURE] Unregistered affiliate ID detected. Defaulting to Main Admin.');
            ref = '1W145K';
            localStorage.setItem('aurum_ref', ref);
        } else if (affData.status === 'suspended') {
            // SUSPENDED DEFENSE: If their node payment failed/lapsed.
            console.warn('[AURUM-SECURE] Suspended affiliate ID detected. Defaulting to Main Admin.');
            ref = '1W145K';
            localStorage.setItem('aurum_ref', ref);
        } else if (affData.is_rotator && affData.rotator_pool) {
            // VALID ROTATOR: Execute Hijack
            const pool = affData.rotator_pool.split(',').map(s => s.trim()).filter(Boolean);
            if (pool.length > 0) {
               let idx = affData.rotator_index || 0;
               if (idx >= pool.length) idx = 0;
               
               // Hijack Session Attribution
               ref = pool[idx];
               localStorage.setItem('aurum_ref', ref);
               
               // Increment Rotator Index in DB for next hit
               const nextIndex = (idx + 1) >= pool.length ? 0 : idx + 1;
               await supabase
                  .from('aurum_affiliates')
                  .update({ rotator_index: nextIndex })
                  .eq('affiliate_code', urlParams.get('ref'));
                  
               console.log(`[AURUM-ROTATOR] Master Link parsed! Session Attribution rewritten to: ${ref}`);
            }
        }

        // --- GLOBAL CLICK TRACKING ENGINE ---
        const lastTracked = sessionStorage.getItem('aurum_click_tracked');
        if (!lastTracked || lastTracked !== ref) {
           const { error: trackErr } = await supabase
              .from('aurum_tracking')
              .insert([{ 
                  affiliate_code: ref, 
                  event_type: 'entry_hit',
                  page_path: window.location.pathname 
              }]);
           if (!trackErr) {
              sessionStorage.setItem('aurum_click_tracked', ref);
              console.log(`[AURUM-TRACKER] Performance Hit Recorded for: ${ref}`);
           }
        }

        // Apply Personal/Agency Skin Overrides if present
        if (affData) {
            if (!activeSkin) activeSkin = {}; // Ensure we have a skin object
            if (affData.brand_name) activeSkin.brand = affData.brand_name;
            if (affData.hero_title) activeSkin.h1 = affData.hero_title;
            if (affData.hero_subtitle) activeSkin.sub = affData.hero_subtitle;
            if (affData.hero_video) {
                // If hero_video contains a vimeo/youtube URL prefix, extract the ID or use full URL
                if (affData.hero_video.includes('youtube.com/embed/')) {
                   activeSkin.videoId = affData.hero_video.split('embed/')[1].split('?')[0];
                } else {
                   activeSkin.videoFullUrl = affData.hero_video;
                }
            }
        }
      } catch (secErr) {
        console.warn('Security intercept failed:', secErr);
      }
      // ------------------------------------
      
      const { data, error } = await supabase
        .from('aurum_organizations')
        .select('brand, color, h1, sub, video_id')
        .eq('code', org.toUpperCase())
        .single();
        
      if (data && !error) {
        activeSkin = {
          brand: data.brand,
          color: data.color,
          gradient: `linear-gradient(135deg, ${data.color}, #555)`,
          h1: data.h1,
          sub: data.sub || (activeSkin ? activeSkin.sub : ''),
          videoId: data.video_id || 'hep0eYXJY8c'
        };
      }
    } catch(e) {
      console.warn('[AURUM-SKIN] Supabase fetch failed, falling back to local.', e);
    }
    
    // E. Update Onboarding Link with Ref (Conversion)
    const updateJoinButton = () => {
      const joinBtn = document.getElementById('final-join-btn') || document.getElementById('dynamic-join-btn') || document.querySelector('.join-btn');
      if (joinBtn) {
        const finalRef = localStorage.getItem('aurum_ref') || '1W145K';
        
        // If we are in rotator mode or redirected session, overwrite the link
        joinBtn.href = `https://backoffice.aurum.foundation/u/${finalRef}`;
        console.log(`[AURUM-TRACKER] Conversion Link Finalized: ${joinBtn.href}`);
      }
    };

    // --- EXECUTE UI UPDATES ---
    updateJoinButton();

    if (!activeSkin) return;

    // A. Apply Styles
    document.documentElement.style.setProperty('--aurum-blue', activeSkin.color);
    document.documentElement.style.setProperty('--accent-grad', activeSkin.gradient);

    // B. Apply Brand Name (Conditional Branding)
    let partnerName = activeSkin.brand || (org === 'Direct' ? 'THE AI FINANCE BREAKDOWN' : org);
    partnerName = partnerName.toUpperCase();
    
    // Official Corporate Branding (No Prefix) vs. Partner Branding (Prefix)
    const fullBrandHTML = (partnerName === 'THE AI FINANCE BREAKDOWN') 
        ? `THE AI<span> FINANCE </span>BREAKDOWN`
        : `AURUM TEAM - ${partnerName}`;

    document.querySelectorAll('.nav-brand').forEach(el => {
      el.innerHTML = fullBrandHTML;
    });

    // B2. Update Browser Tab Title
    if (activeSkin.h1) {
       document.title = activeSkin.h1;
    }

    // C. Apply Content Overrides (if IDs exist on page)
    const h1 = document.getElementById('skin-h1');
    if (h1 && activeSkin.h1) h1.innerText = activeSkin.h1;

    const sub = document.getElementById('skin-sub');
    if (sub && activeSkin.sub) sub.innerText = activeSkin.sub;

    // D. Apply Video Override
    const videoFrame = document.querySelector('#skin-video iframe') || document.querySelector('.video-wrapper iframe');
    if (videoFrame) {
      if (activeSkin.videoFullUrl) {
         videoFrame.src = activeSkin.videoFullUrl;
      } else if (activeSkin.videoId) {
         videoFrame.src = `https://www.youtube.com/embed/${activeSkin.videoId}?rel=0`;
      }
    }
  });
})();
