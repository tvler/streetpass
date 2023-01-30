import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { getConfig } from "./vite.config.shared.js";

/**
 * @param {'chrome' | 'firefox'} target
 */
export function buildManifest(target) {
  const outDir = getConfig(target).build?.outDir;
  assert(outDir);
  const filePath = path.resolve(outDir, "manifest.json");

  /**
   * @type {import("webextension-polyfill").Manifest.WebExtensionManifest}
   */
  const manifest = {
    manifest_version: 3,
    name: "StreetPass for Mastodon",
    version: "2023.4",
    description: "Find your people on Mastodon",
    homepage_url: "https://streetpass.social/",
    permissions: ["storage"],
    background: {
      /**
       * @type {import("webextension-polyfill").Manifest.WebExtensionManifest['background']}
       */
      chrome: {
        service_worker: "background.js",
        type: "module",
      },
      firefox: {
        page: "src/background-page-firefox.html",
      },
    }[target],
    content_scripts: [
      {
        matches: ["https://*/*", "http://*/*"],
        js: ["browser-polyfill.js", "content-script.js"],
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

  if (target === "firefox") {
    // Chrome doesn't support this yet
    manifest.browser_specific_settings = {
      gecko: {
        id: "streetpass@streetpass.social",
      },
    };
  }

  fs.writeFileSync(filePath, JSON.stringify(manifest));
}
