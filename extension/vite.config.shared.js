import path from "node:path";
import { createRequire } from "node:module";
import url from "node:url";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const webextensionPolyfillPathName = require.resolve("webextension-polyfill");

/**
 * @param {'chrome' | 'firefox'} target
 * @returns {import('vite').UserConfig}
 */
export function getConfig(target) {
  const input = [
    webextensionPolyfillPathName,
    path.resolve(dirname, "src/popup.html"),
    path.resolve(dirname, "src/content-script.ts"),
  ];
  if (target === "chrome") {
    input.push(path.resolve(dirname, "src/background.ts"));
  }
  if (target === "firefox") {
    input.push(path.resolve(dirname, "src/background-page-firefox.html"));
  }

  return {
    build: {
      outDir: {
        firefox: path.resolve(dirname, "dist-firefox"),
        chrome: path.resolve(dirname, "dist-chrome"),
      }[target],
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
