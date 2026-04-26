import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Post-It-Note",
  version: "1.1",
  description: "A Note Taking Extension",
  permissions: ["tabs", "contextMenus", "storage"],
  icons: {
    16: "public/icons/icon16.png",
    48: "public/icons/icon48.png",
    128: "public/icons/icon128.png",
  },
  action: {
    default_popup: "src/popup/index.html",
    default_title: "Post-It-Note",
    default_icon: {
      16: "public/icons/icon16.png",
      48: "public/icons/icon48.png",
      128: "public/icons/icon128.png",
    },
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
