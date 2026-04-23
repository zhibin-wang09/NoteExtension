# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Setup

```bash
npm install
npm run dev      # or: npm run build for a one-off production build
```

Then load the extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select the `dist/` directory
4. The extension appears in the toolbar — pin it if needed

For active development, keep `npm run dev` running. @crxjs injects HMR into the built output, so most changes apply automatically without re-loading the extension. If you add or change permissions in `manifest.config.ts`, you must click the reload icon on the extensions page for those changes to take effect.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Type-check + build to dist/
npm run lint     # ESLint
```

**Always run `npm run build` after every source file change.** The extension only picks up changes from `dist/`, so skipping the build means changes have no effect.

No test suite exists yet.

## Architecture

This is a **Manifest V3 Chrome extension** with three independent entry points:

| Entry point | File | Role |
|---|---|---|
| Service worker | `background.ts` | Registers the "Add Note" context menu; relays messages to the content script |
| Content script | `src/content/main.tsx` | Injected into every page; renders the note-taking dialog |
| Popup | `src/popup/main.tsx` | Extension toolbar popup; lists, edits, and deletes saved notes |

### Message flow

Right-click → "Add Note" → `background.ts` sends `{action: "open_note_taker", selectedText, url}` via `chrome.tabs.sendMessage` → content script `App.tsx` receives it and opens a draggable dialog.

### Storage

Notes are saved in `chrome.storage.local`. The current schema uses the **page URL as the key** and the **note text as the value** — meaning one note per URL. This is an in-progress design; `src/content/views/App.tsx:saveBtn` has incomplete code for a multi-note-per-URL structure.

### UI layer

- Components in `src/components/ui/` are Radix UI primitives wrapped with Tailwind — the same pattern as shadcn/ui but hand-rolled.
- Tailwind v4 is configured via the `@tailwindcss/vite` plugin (no `tailwind.config.js` needed).
- Path alias `@` resolves to `src/`.
- The draggable dialog in the content script uses raw `mousemove`/`mouseup` listeners with `requestAnimationFrame` — not dnd-kit (which is installed but unused).

### Key constraint

Content scripts run in an isolated world but share the page DOM. The content script mounts into a `<div id="note_extension_container">` appended to `document.body` and uses `createPortal` to render the dialog into `document.body` directly.
