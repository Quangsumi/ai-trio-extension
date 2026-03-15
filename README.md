# AI Trio — Split-Screen AI Browser Extension

> Chat with ChatGPT, Claude, Gemini, and Grok **side by side** in one window — and send the same prompt to all of them at once.

![Chrome](https://img.shields.io/badge/Chrome-supported-brightgreen?logo=googlechrome) ![Edge](https://img.shields.io/badge/Edge-supported-brightgreen?logo=microsoftedge) ![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)

---

## What is AI Trio?

AI Trio is a Chrome/Edge extension that opens ChatGPT, Claude, Gemini, and Grok in a resizable split-screen layout inside a single browser window. Instead of switching between tabs to compare answers, you can ask all four AIs the same question simultaneously — and watch them respond in real time, side by side.

It uses your **existing browser sessions**, so no API keys or extra logins are required. If you're already logged into the AI sites in your browser, they'll just work.

[![AI Trio Demo](https://img.youtube.com/vi/T53sLgIlw4I/maxresdefault.jpg)](https://youtu.be/T53sLgIlw4I)

---

## Features

- **Split-screen layout** — All four chatbots visible at once in resizable panels
- **Send to all** — Type once in the shared input bar, send to every visible chatbot simultaneously
- **Temporary / Incognito mode** — One 👻 toggle switches all chatbots into their private/temporary chat mode at once (no history saved)
- **Per-panel URL navigation** — Click the ⌁ icon on any panel to navigate it to a specific conversation URL (great for continuing a previous chat)
- **Panel toggle** — Show or hide individual chatbots from the top bar
- **Resizable dividers** — Drag the dividers between panels to adjust their width
- **Per-panel reload** — Reload a single panel without affecting the others
- **Extensible** — Adding a new chatbot takes one line in `chatbots.js`

---

## Supported Chatbots

| Chatbot | Temporary Mode Method |
|---|---|
| ChatGPT | URL parameter `?temporary-chat=true` |
| Claude | URL parameter `/new?incognito` |
| Grok | URL path `/c#private` |
| Gemini | Auto-clicks the dashed-bubble icon in the sidebar |

---

## Installation

> **No store listing required** — install directly from source in under a minute.

1. Download or clone this repository
2. Open your browser and navigate to:
   - **Chrome** → `chrome://extensions`
   - **Edge** → `edge://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `ai-trio-extension` folder
6. The AI Trio icon will appear in your toolbar — click it to open the split screen

---

## How to Use

### Sending a prompt to all chatbots
Type your question in the **input bar at the bottom** of the window and press **Enter**. Your prompt will be automatically typed and submitted to every visible panel.

Use **Shift + Enter** to add a new line without sending.

### Temporary / private mode
Click the **👻 Temporary** button in the top-right of the header to switch all chatbots into their private/incognito mode at once. Click again to return to normal mode. In temporary mode, conversations are not saved to history.

### Navigating to a previous conversation
Click the **⌁ icon** next to any chatbot's reload button. A URL bar slides open — paste a direct conversation URL (e.g. `https://claude.ai/chat/abc123`) and press Enter. That panel will navigate to that conversation while the others stay untouched.

### Showing / hiding panels
Click any chatbot name in the top bar (ChatGPT / Claude / Gemini / Grok) to toggle that panel on or off. Hidden panels are skipped when sending prompts.

### Resizing panels
Drag the vertical dividers between panels to adjust their width.

---

## Adding a New Chatbot

Open `chatbots.js` and add one entry to the `CHATBOTS` array:

```js
{ id: 'mychat', name: 'MyChat', url: 'https://mychat.com', color: '#ff9900' },
```

Then add a corresponding rule in `rules.json` to strip the `X-Frame-Options` header for that domain, and add its URL to `host_permissions` in `manifest.json`.

---

## How It Works

The extension opens each AI site inside an `<iframe>` in a dedicated split-screen window. A content script (`content.js`) is injected into each iframe and listens for `postMessage` events from the parent page. When you hit Send, the parent sends a message to each visible iframe, and the content script types your text into the chatbot's input field and clicks the send button — all using standard DOM events.

Header stripping rules (`rules.json`) use Chrome's `declarativeNetRequest` API to remove `X-Frame-Options` and `Content-Security-Policy` headers from the AI sites, which would otherwise block them from loading inside iframes.

---

## Permissions

| Permission | Reason |
|---|---|
| `tabs` / `windows` | Open and manage the split-screen window |
| `declarativeNetRequest` | Strip iframe-blocking headers from AI sites |
| `host_permissions` | Inject content scripts into the AI chatbot domains |

---

## Limitations

- **Login required** — You must be logged into each chatbot in your browser before they'll load
- **Site changes** — AI sites update their UI frequently; send selectors or temporary mode buttons may occasionally break after an update
- **Some sites block iframes entirely** — Sites like Perplexity and Microsoft Copilot use strict `frame-ancestors` CSP policies that cannot be bypassed

---

## License

MIT — do whatever you want with it.
