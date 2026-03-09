// ── Build UI ──────────────────────────────────────────────────────────────────
const togglesEl   = document.getElementById('toggles');
const reloadsEl   = document.getElementById('reloads');
const panelsEl    = document.getElementById('panels');
const privateBtnEl = document.getElementById('private-btn');
const frames      = {};

// URL-based private modes (instant, no clicking needed)
const PRIVATE_URLS = {
  chatgpt: { on: 'https://chatgpt.com/?temporary-chat=true', off: 'https://chatgpt.com' },
  claude:  { on: 'https://claude.ai/new?incognito',          off: 'https://claude.ai/new' },
  grok:    { on: 'https://grok.com/c#private',               off: 'https://grok.com' },
};

// Button-based private modes (needs content.js to click the in-page button)
const BUTTON_PRIVATE = { gemini: true };

CHATBOTS.forEach((bot, i) => {
  const c = bot.color;

  // Toggle button
  const toggle = document.createElement('button');
  toggle.className   = 'ptoggle active';
  toggle.dataset.id  = bot.id;
  toggle.textContent = bot.name;
  toggle.style.setProperty('--c', c);
  togglesEl.appendChild(toggle);

  // Reload + URL-toggle buttons
  const reload = document.createElement('button');
  reload.className   = 'reload-btn';
  reload.dataset.id  = bot.id;
  reload.textContent = '↺ ' + bot.name;
  reloadsEl.appendChild(reload);

  const urlBtn = document.createElement('button');
  urlBtn.className   = 'url-toggle-btn';
  urlBtn.dataset.id  = bot.id;
  urlBtn.title       = 'Navigate ' + bot.name + ' to URL';
  urlBtn.innerHTML   = '⌁';
  reloadsEl.appendChild(urlBtn);

  // Divider
  if (i > 0) {
    const div = document.createElement('div');
    div.className       = 'divider';
    div.dataset.leftId  = CHATBOTS[i - 1].id;
    div.dataset.rightId = bot.id;
    panelsEl.appendChild(div);
  }

  // Panel
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.id        = 'panel-' + bot.id;

  // URL bar
  const urlbar  = document.createElement('div');
  urlbar.className = 'panel-urlbar';
  urlbar.id        = 'urlbar-' + bot.id;
  const urlInput   = document.createElement('input');
  urlInput.type        = 'text';
  urlInput.placeholder = 'Paste conversation URL and press Enter…';
  urlInput.id          = 'urlinput-' + bot.id;
  const goBtn = document.createElement('button');
  goBtn.className   = 'go-btn';
  goBtn.textContent = 'Go';
  urlbar.appendChild(urlInput);
  urlbar.appendChild(goBtn);

  // Loader
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.id        = 'loader-' + bot.id;
  loader.innerHTML =
    '<div class="spinner" style="border-top-color:' + c + '"></div>' +
    '<span class="loader-label">loading ' + bot.name.toLowerCase() + '…</span>';

  // iframe
  const iframe = document.createElement('iframe');
  iframe.id  = 'frame-' + bot.id;
  iframe.src = bot.url;
  iframe.setAttribute('sandbox',
    'allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-storage-access-by-user-activation');
  iframe.setAttribute('allow', 'clipboard-read; clipboard-write; microphone');
  iframe.addEventListener('load', () => setTimeout(() => loader.classList.add('gone'), 600));

  panel.appendChild(urlbar);
  panel.appendChild(loader);
  panel.appendChild(iframe);
  panelsEl.appendChild(panel);
  frames[bot.id] = iframe;

  // URL bar navigation
  function navigate() {
    let url = urlInput.value.trim();
    if (!url) return;
    if (!url.startsWith('http')) url = 'https://' + url;
    loader.classList.remove('gone');
    iframe.src = url;
    urlInput.value = '';
    urlbar.classList.remove('open');
    urlBtn.classList.remove('active');
  }
  goBtn.addEventListener('click', navigate);
  urlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') navigate();
    if (e.key === 'Escape') { urlbar.classList.remove('open'); urlBtn.classList.remove('active'); }
  });
});

// ── Reload ────────────────────────────────────────────────────────────────────
function reloadFrame(id) {
  const loader = document.getElementById('loader-' + id);
  loader.classList.remove('gone');
  const src = frames[id].src;
  frames[id].src = 'about:blank';
  setTimeout(() => { frames[id].src = src; }, 60);
}

reloadsEl.addEventListener('click', e => {
  const reloadBtn = e.target.closest('.reload-btn');
  if (reloadBtn) { reloadFrame(reloadBtn.dataset.id); return; }

  const urlBtn = e.target.closest('.url-toggle-btn');
  if (urlBtn) {
    const id     = urlBtn.dataset.id;
    const urlbar = document.getElementById('urlbar-' + id);
    const input  = document.getElementById('urlinput-' + id);
    const isOpen = urlbar.classList.toggle('open');
    urlBtn.classList.toggle('active', isOpen);
    if (isOpen) setTimeout(() => input.focus(), 210);
  }
});

// ── Panel toggles ─────────────────────────────────────────────────────────────
togglesEl.addEventListener('click', e => {
  const btn = e.target.closest('.ptoggle');
  if (!btn) return;
  const id    = btn.dataset.id;
  const panel = document.getElementById('panel-' + id);
  const hide  = !panel.classList.contains('hidden');
  panel.classList.toggle('hidden', hide);
  btn.classList.toggle('active', !hide);
});

// ── Resizable dividers ────────────────────────────────────────────────────────
function initDividers() {
  panelsEl.querySelectorAll('.divider').forEach(divider => {
    let dragging = false, startX = 0, leftStart = 0, rightStart = 0;
    let leftPanel = null, rightPanel = null;

    divider.addEventListener('mousedown', e => {
      e.preventDefault();
      dragging   = true;
      startX     = e.clientX;
      leftPanel  = document.getElementById('panel-' + divider.dataset.leftId);
      rightPanel = document.getElementById('panel-' + divider.dataset.rightId);
      leftStart  = leftPanel.getBoundingClientRect().width;
      rightStart = rightPanel.getBoundingClientRect().width;
      divider.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      panelsEl.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = 'none');
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      leftPanel.style.flex  = '0 0 ' + Math.max(120, leftStart  + dx) + 'px';
      rightPanel.style.flex = '0 0 ' + Math.max(120, rightStart - dx) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      divider.classList.remove('dragging');
      document.body.style.cursor = '';
      panelsEl.querySelectorAll('iframe').forEach(f => {
        f.style.pointerEvents = '';
        f.style.width = '99.9%';
        requestAnimationFrame(() => { f.style.width = '100%'; });
      });
    });
  });
}
initDividers();

// ── Private / Temporary mode toggle ──────────────────────────────────────────
let privateActive = false;

privateBtnEl.addEventListener('click', () => {
  privateActive = !privateActive;
  privateBtnEl.classList.toggle('active', privateActive);
  privateBtnEl.title = privateActive
    ? 'Switch back to normal chat (all bots)'
    : 'Switch to temporary / incognito chat (all bots)';

  CHATBOTS.forEach(bot => {
    const panel = document.getElementById('panel-' + bot.id);
    if (panel.classList.contains('hidden')) return;

    if (PRIVATE_URLS[bot.id]) {
      // URL-based: navigate the iframe directly
      const loader = document.getElementById('loader-' + bot.id);
      loader.classList.remove('gone');
      frames[bot.id].src = privateActive
        ? PRIVATE_URLS[bot.id].on
        : PRIVATE_URLS[bot.id].off;
    } else if (BUTTON_PRIVATE[bot.id]) {
      if (privateActive) {
        // Single send — no retry, a second call would double-trigger the in-page button
        setTimeout(() => {
          try {
            frames[bot.id].contentWindow.postMessage(
              { type: 'AI_TRIO_PRIVATE', platform: bot.id }, '*'
            );
          } catch(e) {}
        }, 300);
      } else {
        // Navigate back to default URL to exit private mode
        const loader = document.getElementById('loader-' + bot.id);
        loader.classList.remove('gone');
        frames[bot.id].src = CHATBOTS.find(b => b.id === bot.id).url;
      }
    }
  });

  showToast(
    privateActive
      ? '👻 Temporary mode on — chats won\'t be saved'
      : '💬 Back to normal mode',
    'ok'
  );
});

// ── Send to all ───────────────────────────────────────────────────────────────
const promptEl = document.getElementById('prompt');
const sendBtn  = document.getElementById('send-btn');

function sendToAll() {
  const text = promptEl.value.trim();
  if (!text) return;
  promptEl.value = '';
  promptEl.style.height = 'auto';
  let sent = 0;
  CHATBOTS.forEach(bot => {
    const panel = document.getElementById('panel-' + bot.id);
    if (panel.classList.contains('hidden')) return;
    frames[bot.id].contentWindow.postMessage(
      { type: 'AI_TRIO_TYPE', text, platform: bot.id }, '*'
    );
    sent++;
  });
  if (sent > 0) showToast('✓ Sent to ' + sent + ' chatbot' + (sent > 1 ? 's' : ''), 'ok');
}

sendBtn.addEventListener('click', sendToAll);
promptEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendToAll(); }
});
promptEl.addEventListener('input', () => {
  promptEl.style.height = 'auto';
  promptEl.style.height = Math.min(promptEl.scrollHeight, 120) + 'px';
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'show' + (type ? ' ' + type : '');
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.className = ''; }, 2500);
}
