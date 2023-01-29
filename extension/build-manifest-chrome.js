import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { chromeConfig } from "./vite.config.shared.js";

assert(chromeConfig.build?.outDir);
const filePath = path.resolve(chromeConfig.build?.outDir, "manifest.json");

const manifest = {
  manifest_version: 3,
  name: "StreetPass for Mastodon",
  description: "Find your people on Mastodon",
  version: "2023.4",
  permissions: ["storage"],
  background: {
    service_worker: "background.js",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["https://*/*", "http://*/*"],
      js: ["webextension-polyfill.js", "content-script.js"],
    },
  ],
  icons: {
    128: "icon128.png",
    256: "icon256.png",
  },
  action: {
    default_popup: "src/popup.html",
    default_title: "StreetPass",
    default_icon: "action-inactive.png",
  },
};

fs.writeFileSync(filePath, JSON.stringify(manifest));
