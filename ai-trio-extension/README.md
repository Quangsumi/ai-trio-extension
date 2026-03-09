# AI Trio — Browser Extension

ChatGPT + Claude + Gemini, side by side in one tab.  
Uses your **real browser session** — no extra login needed.

---

## Install in Chrome / Edge (takes 1 minute)

1. Open your browser and go to:
   - **Chrome** → `chrome://extensions`
   - **Edge**   → `edge://extensions`

2. Enable **Developer mode** (toggle in the top-right corner)

3. Click **"Load unpacked"**

4. Select the `ai-trio-extension` folder (this folder)

5. Done! The AI Trio icon appears in your toolbar.

---

## How to use

1. Click the **AI Trio icon** in your toolbar
2. Click **"Open Split Screen"**
3. A full window opens with ChatGPT, Claude, and Gemini side by side — already logged in
4. Type your question in the **bottom input bar** and press **Enter** to send to all three

### Tips
- **Drag the dividers** between panels to resize them
- **Toggle panels** on/off using the chips in the top bar (ChatGPT / Claude / Gemini)
- **↺ reload** button reloads a single panel if it gets stuck
- The **broadcast input** toggle lets you turn off auto-send if you want to type manually

---

## How "Send to All" works

The extension injects a content script into any open ChatGPT, Claude, and Gemini tabs.  
When you hit Send, the background script finds those tabs and types your prompt + clicks Send automatically.

> **Note:** The split-screen shows the AI sites in iframes. Because of browser security rules,  
> iframes can't be directly scripted across origins — so the send feature works by targeting  
> the *actual open tabs* for each site in your browser. For best results, keep the AI sites  
> loaded in their own tabs (the split screen opens them automatically on first launch if needed).

---

## Uninstall

Go to `chrome://extensions`, find AI Trio, click **Remove**.
