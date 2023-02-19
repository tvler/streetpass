import path from "node:path";
import { createRequire } from "node:module";
import url from "node:url";
import type { UserConfig } from "vite";
import type { Manifest } from "webextension-polyfill";

import { VERSION } from "../constants.js";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const webextensionPolyfillPathName = require.resolve("webextension-polyfill");

type Target = "chrome" | "firefox" | "safari";

export function getConfig(target: Target): UserConfig {
  function targets<Value>(
    args: Record<Target, Value>
  ): (typeof args)[keyof typeof args] {
    return args[target];
  }

  const input = [
    webextensionPolyfillPathName,
    path.resolve(dirname, "src/popup.html"),
    path.resolve(dirname, "src/content-script.ts"),
    targets({
      chrome: path.resolve(dirname, "src/background.ts"),
      firefox: path.resolve(dirname, "src/background-page-firefox.html"),
      // safari: path.resolve(dirname, "src/background.ts"),
      safari: path.resolve(dirname, "src/background-page-firefox.html"),
    }),
  ];

  return {
    plugins: [
      {
        name: "build-manifest",
        generateBundle() {
          const manifest: Manifest.WebExtensionManifest = {
            manifest_version: targets({ chrome: 3, firefox: 2, safari: 3 }),
            name: "StreetPass for Mastodon",
            version: VERSION,
            description: "Find your people on Mastodon",
            homepage_url: "https://streetpass.social/",
            permissions: ["storage"],
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
            ...(() => {
              const action: Manifest.ActionManifest = {
                default_popup: "src/popup.html",
                default_title: "StreetPass",
                default_icon: "action-inactive.png",
              };
              return targets<
                | Pick<Manifest.WebExtensionManifest, "action">
                | Pick<Manifest.WebExtensionManifest, "browser_action">
              >({
                chrome: { action: action },
                firefox: { browser_action: action },
                safari: { action: action },
              });
            })(),
            background: targets<Manifest.WebExtensionManifest["background"]>({
              chrome: {
                service_worker: "background.js",
                type: "module",
              },
              firefox: {
                page: "src/background-page-firefox.html",
                persistent: false,
              },
              safari: {
                page: "src/background-page-firefox.html",
                // service_worker: "background.js",
              },
            }),
          };
          if (target === "firefox") {
            // Chrome doesn't support this yet
            manifest.browser_specific_settings = {
              gecko: {
                id: "streetpass@streetpass.social",
              },
            };
          }

          this.emitFile({
            type: "asset",
            fileName: "manifest.json",
            source: JSON.stringify(manifest),
          });
        },
      },
    ],
    build: {
      outDir: targets({
        firefox: path.resolve(dirname, "dist-firefox"),
        chrome: path.resolve(dirname, "dist-chrome"),
        safari: path.resolve(dirname, "dist-safari"),
      }),
      target: "esnext",
      emptyOutDir: true,
      minify: false,
      modulePreload: {
        polyfill: false,
        resolveDependencies: () => [],
      },
      commonjsOptions: {
        include: [],
      },
      rollupOptions: {
        strictDeprecations: true,
        preserveEntrySignatures: "strict",
        input: input,
        output: {
          minifyInternalExports: false,
          validate: true,
          entryFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`,
          chunkFileNames: `[name].js`,
          esModule: true,
        },
      },
    },
  };
}
