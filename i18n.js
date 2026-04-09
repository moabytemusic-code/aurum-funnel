/**
 * AURUM Funnel i18n Engine
 * Handles language detection, persistence, and DOM updates.
 */
(function() {
  const STORAGE_KEY = 'aurum_lang';
  const DEFAULT_LANG = 'en';
  
  // 1. Determine Language
  function getLang() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && window.AURUM_TRANSLATIONS[urlLang]) {
      localStorage.setItem(STORAGE_KEY, urlLang);
      return urlLang;
    }
    
    const storedLang = localStorage.getItem(STORAGE_KEY);
    if (storedLang && window.AURUM_TRANSLATIONS[storedLang]) {
      return storedLang;
    }
    
    const browserLang = navigator.language.split('-')[0];
    if (window.AURUM_TRANSLATIONS[browserLang]) {
      return browserLang;
    }
    
    return DEFAULT_LANG;
  }

  let currentLang = getLang();

  // 2. Apply Translations to DOM
  function applyTranslations() {
    console.log(`[AURUM-I18N] Applying lang: ${currentLang}`);
    const dict = window.AURUM_TRANSLATIONS[currentLang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        // Handle elements with HTML content
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.innerHTML = dict[key];
        }
      }
    });

    // Update lang attribute on html tag
    document.documentElement.lang = currentLang;
    
    // Update active state on language switchers
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Dispatch event for other scripts (like skin.js) to respond
    window.dispatchEvent(new CustomEvent('aurum-lang-changed', { detail: currentLang }));
  }

  // 3. Switch Language Function
  window.setLanguage = function(lang) {
    if (!window.AURUM_TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations();
  };

  // 4. Initialize
  document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for language switcher if needed
    const style = document.createElement('style');
    style.textContent = `
      .lang-switcher { display: flex; gap: 8px; font-size: 0.75rem; font-weight: 700; margin-left: 12px; }
      .lang-btn { cursor: pointer; opacity: 0.5; transition: opacity 0.2s; text-transform: uppercase; color: var(--text-main); text-decoration: none; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--glass-border); }
      .lang-btn.active { opacity: 1; border-color: var(--aurum-blue); color: var(--aurum-blue); }
      @media (max-width: 768px) {
        .lang-switcher { margin-left: 0; margin-top: 4px; }
      }
    `;
    document.head.appendChild(style);

    applyTranslations();
  });

})();
