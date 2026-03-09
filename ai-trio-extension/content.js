// AI Trio — content script
if (!window.__aiTrioReady) {
  window.__aiTrioReady = true;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function detectPlatform() {
    const h = location.hostname;
    if (h.includes('chatgpt.com') || h.includes('chat.openai.com')) return 'chatgpt';
    if (h.includes('claude.ai'))         return 'claude';
    if (h.includes('gemini.google.com')) return 'gemini';
    if (h.includes('grok.com'))          return 'grok';
    return null;
  }

  // ── Input/send selectors ─────────────────────────────────────────────────────
  const CONFIGS = {
    chatgpt: {
      inputs: ['#prompt-textarea', 'div#prompt-textarea[contenteditable]', 'textarea#prompt-textarea'],
      sends:  ['button[data-testid="send-button"]', 'button[aria-label="Send prompt"]', 'button[aria-label="Send message"]'],
    },
    claude: {
      inputs: ['div[contenteditable="true"][data-testid]', 'div[contenteditable="true"].ProseMirror', 'fieldset div[contenteditable="true"]', 'div[contenteditable="true"]'],
      sends:  ['button[aria-label="Send message"]', 'button[aria-label="Send Message"]', 'button[data-testid="send-button"]'],
    },
    gemini: {
      inputs: ['div.ql-editor[contenteditable="true"]', 'rich-textarea div[contenteditable="true"]', 'div[contenteditable="true"][aria-label*="message" i]'],
      sends:  ['button[aria-label="Send message"]', 'button[aria-label="Send"]', 'button[jsname][aria-label*="send" i]'],
    },
    grok: {
      inputs: ['textarea[placeholder*="message" i]', 'textarea[placeholder*="ask" i]', 'div[contenteditable="true"]', 'textarea'],
      sends:  ['button[aria-label*="send" i]', 'button[type="submit"]', 'button[data-testid*="send" i]'],
    },
  };

  function findEl(selectors) {
    for (const sel of selectors) {
      try { const el = document.querySelector(sel); if (el) return el; } catch(e) {}
    }
    return null;
  }

  async function waitForEl(selectors, timeout = 8000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const el = findEl(selectors);
      if (el) return el;
      await sleep(200);
    }
    return null;
  }

  // ── Type + send ──────────────────────────────────────────────────────────────
  async function typeAndSend(text, platform) {
    const cfg = CONFIGS[platform || detectPlatform()];
    if (!cfg) return;
    const el = await waitForEl(cfg.inputs);
    if (!el) return;

    el.focus();
    await sleep(100);

    const isEditable = el.isContentEditable || el.getAttribute('contenteditable') === 'true';
    if (isEditable) {
      el.innerHTML = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(50);
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      const ok = document.execCommand('insertText', false, text);
      if (!ok || !el.textContent.trim()) {
        el.innerText = text;
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
      }
    } else {
      const proto  = Object.getPrototypeOf(el);
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(el, text); else el.value = text;
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    await sleep(400);
    for (const sel of cfg.sends) {
      try { const btn = document.querySelector(sel); if (btn && !btn.disabled) { btn.click(); return; } } catch(e) {}
    }
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }));
  }

  // ── Gemini: expand sidebar, then click the SVG-icon button (never <a> links) ──
  async function activateGeminiPrivate() {
    // The real temp chat button is a <button> with an SVG child (dashed bubble icon)
    // AND its aria-label contains "temporary". We pass an exclusion element to avoid
    // re-clicking the sidebar toggle button itself.
    function findGeminiTempButton(exclude) {
      for (const btn of document.querySelectorAll('button')) {
        if (btn === exclude) continue;
        const label = (btn.getAttribute('aria-label') || btn.getAttribute('data-test-id') || '').toLowerCase();
        if (btn.querySelector('svg') && label.includes('temporary')) return btn;
      }
      return null;
    }

    // Sidebar toggle selectors
    const sidebarToggles = [
      'button[aria-label*="menu" i]',
      'button[aria-label*="navigation" i]',
      'button[aria-label*="collapse" i]',
      'button[aria-label*="expand" i]',
      'button[aria-label*="sidebar" i]',
      'mat-sidenav button[aria-label]',
      'nav > button',
    ];

    // If temp button already visible (sidebar already open), click once and done
    let tempBtn = findGeminiTempButton(null);
    if (tempBtn) { tempBtn.click(); return; }

    // Sidebar is collapsed — find toggle, expand it, then search excluding that toggle
    const toggleBtn = findEl(sidebarToggles);
    if (!toggleBtn || toggleBtn.tagName !== 'BUTTON') return;

    toggleBtn.click();

    // Poll for temp button, always excluding the toggle button from results
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      await sleep(250);
      tempBtn = findGeminiTempButton(toggleBtn);
      if (tempBtn) { tempBtn.click(); return; }
    }
  }

  // ── postMessage listener ─────────────────────────────────────────────────────
  window.addEventListener('message', e => {
    if (!e.data) return;
    if (e.data.type === 'AI_TRIO_TYPE') typeAndSend(e.data.text, e.data.platform);
    if (e.data.type === 'AI_TRIO_PRIVATE' && (e.data.platform || detectPlatform()) === 'gemini')
      activateGeminiPrivate();
  });
}
