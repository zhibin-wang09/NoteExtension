# NoteExtension

A basic Chrome extension project template.

## Demo

<video src="media/NoteExtensionDemo.mov" controls width="100%"></video>

## Files

- `manifest.json`: Extension manifest file (Manifest V3).
- `background.js`: Background service worker script.
- `content.js`: Content script injected into web pages.
- `popup.html`: HTML for the extension popup.
- `popup.js`: JavaScript for the popup functionality.
- `icons/`: Directory for extension icons (add icon16.png, icon48.png, icon128.png).

## Setup

1. Add your extension icons to the `icons/` directory.
2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" in the top right.
   - Click "Load unpacked" and select this directory.
3. The extension will appear in the toolbar. Click it to see the popup.

## Development

- Modify `manifest.json` to add permissions or change functionality.
- Edit `background.js` for background tasks.
- Update `content.js` to interact with web pages.
- Customize `popup.html` and `popup.js` for the UI.

## Permissions

Currently, no special permissions are requested. Add them in `manifest.json` as needed (e.g., "activeTab", "storage").
