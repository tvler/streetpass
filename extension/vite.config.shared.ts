import path from "node:path";
import { createRequire } from "node:module";
import url from "node:url";
import { type ConfigEnv, type PluginOption, type UserConfig } from "vite";
import type { Manifest } from "webextension-polyfill";
import childProcess from "node:child_process";
import { z } from "zod";
import assert from "node:assert";
import ViteReact from "@vitejs/plugin-react";

import { VERSION } from "../constants.js";
import { Target, actionInactive, actionActive } from "./src/util/constants.js";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const webextensionPolyfillPathName = require.resolve("webextension-polyfill");

const configSchema = z.object({
  mode: z.union([z.literal("dev"), z.literal("production")]),
});

export function getConfig(
  target: Target,
  unparsedConfig: ConfigEnv,
): UserConfig {
  const config = configSchema.parse(unparsedConfig);

  function targets<Value>(
    args: Record<Target, Value>,
  ): (typeof args)[keyof typeof args] {
    return args[target];
  }

  const extensionName = `StreetPass for Mastodon${
    config.mode === "dev"
      ? ` ${new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })
          .format()
          .replaceAll(",", "")
          .replaceAll(":", " ")}`
      : ``
  }`;

  return {
    plugins: [
      ViteReact(),
      {
        name: "build-manifest",
        generateBundle() {
          const manifest: Manifest.WebExtensionManifest = {
            manifest_version: targets({ chrome: 3, firefox: 2, safari: 3 }),
            name: extensionName,
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
            icons: targets({
              chrome: {
                128: "icon-128.png",
                256: "icon-256.png",
              },
              firefox: {
                128: "icon-128.png",
                256: "icon-256.png",
              },
              safari: {
                128: "icon-128-nopadding.png",
                256: "icon-256-nopadding.png",
              },
            }),
            ...(() => {
              const action: Manifest.ActionManifest = {
                default_popup: "src/popup.html",
                default_title: "StreetPass",
                default_icon: targets<Record<string, string>>({
                  chrome: actionInactive,
                  firefox: actionInactive,
                  safari:
                    /**
                     * Safari can't render grayed out icon
                     */
                    actionActive,
                }),
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
            background: targets({
              chrome: {
                service_worker: "background.js",
                type: "module",
              },
              firefox: {
                page: "src/background-page.html",
                persistent: false,
              },
              safari: {
                service_worker: "background.js",
                type: "module",
              },
            }),
          };
          if (target === "firefox") {
            manifest.browser_specific_settings = {
              gecko: {
                id: "streetpass@streetpass.social",
              },
            };
          }
          if (target === "safari") {
            // @ts-expect-error types aren't updated https://developer.apple.com/documentation/safariservices/safari_web_extensions/optimizing_your_web_extension_for_safari#3743239
            const SAFARI: keyof Manifest.BrowserSpecificSettings = "safari";
            manifest.browser_specific_settings = {
              [SAFARI]: {
                // Only safari 16.4 supports background modules https://webkit.org/blog/13966/webkit-features-in-safari-16-4/
                strict_min_version: "16.4",
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
      targets<PluginOption>({
        chrome: null,
        firefox: null,
        safari: {
          name: "build-safari-app",
          writeBundle(options) {
            assert(options.dir);

            childProcess.spawnSync(
              `xcrun /Applications/Xcode.app/Contents/Developer/usr/bin/safari-web-extension-converter`,
              [
                "--swift",
                "--macos-only",
                "--no-open",
                "--project-location",
                options.dir,
                options.dir,
              ],
              {
                shell: true,
                stdio: "inherit",
              },
            );

            if (config.mode === "dev") {
              childProcess.spawnSync(
                "xcodebuild",
                [
                  "-project",
                  `"${path.resolve(
                    options.dir,
                    `${extensionName}`,
                    `${extensionName}.xcodeproj`,
                  )}"`,
                  "-allowProvisioningUpdates",
                  "DEVELOPMENT_TEAM=WLTVAXDPZT",
                  "-quiet",
                ],
                {
                  shell: true,
                  stdio: "inherit",
                },
              );
            }
          },
        },
      }),
    ],
    publicDir: "public",
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
        exclude: [/node_modules\/webextension-polyfill/],
      },
      rollupOptions: {
        strictDeprecations: true,
        preserveEntrySignatures: "strict",
        input: [
          webextensionPolyfillPathName,
          path.resolve(dirname, "src/popup.html"),
          path.resolve(dirname, "src/content-script.ts"),
          targets({
            chrome: path.resolve(dirname, "src/background.ts"),
            firefox: path.resolve(dirname, "src/background-page.html"),
            safari: path.resolve(dirname, "src/background.ts"),
          }),
        ],
        output: {
          minifyInternalExports: false,
          inlineDynamicImports: false,
          validate: true,
          entryFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`,
          chunkFileNames: `[name].js`,
          esModule: true,
        },
      },
    },
    define: {
      __TARGET__: JSON.stringify(target),
    },
  };
}
