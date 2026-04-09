/**
 * AURUM Admin Gate
 * Enforces Master Access (Service Role Key) for admin pages
 */
(function() {
  const MASTER_KEY_STORAGE = 'AURUM_MASTER_KEY';
  
  function checkAccess() {
    const currentKey = sessionStorage.getItem(MASTER_KEY_STORAGE) || localStorage.getItem(MASTER_KEY_STORAGE);
    
    // If we only have the anon key (or no key), show the gate
    if (!currentKey || currentKey.startsWith('sb_publishable')) {
      showGate();
    }
  }

  function showGate() {
    // Inject styles
    const style = document.createElement('style');
    style.innerHTML = `
      #aurum-admin-gate {
        position: fixed; inset: 0; background: #030712; z-index: 10000;
        display: flex; align-items: center; justify-content: center; padding: 24px;
        font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #fff;
      }
      .gate-card {
        background: #0F172A; border: 1px solid rgba(255,255,255,0.08);
        padding: 48px; border-radius: 24px; width: 100%; max-width: 480px;
        text-align: center; box-shadow: 0 40px 100px rgba(0,0,0,0.5);
      }
      .gate-card h1 { font-size: 1.75rem; font-weight: 900; margin-bottom: 12px; letter-spacing: -0.02em; }
      .gate-card p { color: #94A3B8; margin-bottom: 32px; font-size: 0.95rem; line-height: 1.5; }
      .gate-input {
        width: 100%; padding: 18px 24px; border-radius: 14px;
        background: #030712; border: 1px solid rgba(255,255,255,0.1);
        color: #fff; font-size: 0.95rem; font-weight: 600; margin-bottom: 20px;
        transition: all 0.2s; text-align: center;
      }
      .gate-input:focus { outline: none; border-color: #0073FF; background: rgba(0,115,255,0.05); }
      .gate-btn {
        width: 100%; padding: 18px; border-radius: 14px;
        background: linear-gradient(135deg, #0073FF, #3898F8);
        color: #fff; font-size: 1.1rem; font-weight: 800; border: none; cursor: pointer;
        transition: all 0.3s; box-shadow: 0 20px 40px rgba(0,115,255,0.2);
      }
      .gate-btn:hover { transform: translateY(-2px); box-shadow: 0 30px 60px rgba(0,115,255,0.3); }
      .gate-error { color: #ef4444; font-size: 0.85rem; font-weight: 700; margin-top: 16px; display: none; }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const gate = document.createElement('div');
    gate.id = 'aurum-admin-gate';
    gate.innerHTML = `
      <div class="gate-card">
        <div style="font-weight: 900; color: #0073FF; margin-bottom: 24px; letter-spacing: 0.1em; font-size: 0.8rem;">ADMINISTRATION ACCESS</div>
        <h1>Master Unlock</h1>
        <p>This dashboard is now secured with Row-Level Security. Please enter your <b>Supabase Service Role Key</b> to proceed.</p>
        <input type="password" id="master-key-input" class="gate-input" placeholder="Paste Service Role Key (sb_secret_...)">
        
        <label style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 24px; color: #94A3B8; font-size: 0.85rem; cursor: pointer; font-weight: 600;">
          <input type="checkbox" id="remember-me" style="accent-color: #0073FF; width: 16px; height: 16px;">
          Remember Me on this Computer
        </label>

        <button id="unlock-btn" class="gate-btn">Initialize Privileged Node →</button>
        <div id="gate-error" class="gate-error">Invalid Key. Access Denied.</div>
        
        <a href="index.html" style="display: block; margin-top: 32px; color: #64748b; text-decoration: none; font-size: 0.85rem; font-weight: 600;">← Return to Public Funnel</a>
      </div>
    `;
    document.body.appendChild(gate);

    // Event Listeners
    document.getElementById('unlock-btn').addEventListener('click', async () => {
      const key = document.getElementById('master-key-input').value.trim();
      const errorEl = document.getElementById('gate-error');
      
      if (!key) return;

      // Basic validation: service role keys usually start with 'sb_secret' or are very long JWTs
      if (key.length < 50) {
        errorEl.style.display = 'block';
        return;
      }

      // Test the key (Try to fetch count from a secured table)
      try {
        if (window.initAurumClient(key)) {
           // Small delay to ensure client is ready
           setTimeout(async () => {
             const { error } = await window.aurumDB.from('aurum_members').select('count', { count: 'exact', head: true });
             
             if (error) {
               console.error("Key validation failed:", error);
               errorEl.style.display = 'block';
               errorEl.innerText = "Key Validation Failed: " + error.message;
             } else {
               const remember = document.getElementById('remember-me').checked;
               if (remember) {
                 localStorage.setItem(MASTER_KEY_STORAGE, key);
               } else {
                 sessionStorage.setItem(MASTER_KEY_STORAGE, key);
               }
               location.reload();
             }
           }, 100);
        }
      } catch (e) {
        errorEl.style.display = 'block';
      }
    });

    // Support Enter key
    document.getElementById('master-key-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('unlock-btn').click();
    });
  }

  // Create a global Logout function
  window.aurumAdminLogout = () => {
    sessionStorage.removeItem(MASTER_KEY_STORAGE);
    localStorage.removeItem(MASTER_KEY_STORAGE);
    location.reload();
  };

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAccess);
  } else {
    checkAccess();
  }
})();
