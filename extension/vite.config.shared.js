import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const webextensionPolyfillPathName = require.resolve("webextension-polyfill");

/**
 * @type {import('vite').UserConfig}
 */
export const sharedConfig = {
  build: {
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
      input: {
        "webextension-polyfill": webextensionPolyfillPathName,
        popup: path.resolve(__dirname, "src/popup.html"),
        background: path.resolve(__dirname, "src/background.ts"),
        "content-script": path.resolve(__dirname, "src/content-script.ts"),
      },
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

/**
 * @type {import('vite').UserConfig}
 */
export const chromeConfig = {
  ...sharedConfig,
  build: {
    ...sharedConfig.build,
    outDir: path.resolve(__dirname, "dist-chrome"),
  },
};
