import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "NoteExtension",
  version: "1.0",
  description: "A Note Taking Extension",
  permissions: ["tabs", "contextMenus"],
  action: {
    default_popup: "src/popup/index.html",
    default_title: "NoteExtension",
  },
  background: {
    service_worker: "background.ts",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/main.tsx"],
      css: ["src/content/views/App.css"],
    },
  ],
  web_accessible_resources: [
    {
      resources: ["src/content/views/App.css"],
      matches: ["<all_urls>"],
    },
  ],
});
