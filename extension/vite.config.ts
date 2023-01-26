import path from "node:path";
import { defineConfig } from "vite";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const webextensionPolyfillPathName = require.resolve("webextension-polyfill");

export default defineConfig({
  build: {
    target: "esnext",
    emptyOutDir: true,
    minify: false,
    modulePreload: false,
    commonjsOptions: {
      include: [],
    },
    rollupOptions: {
      input: {
        "webextension-polyfill": webextensionPolyfillPathName,
        popup: path.resolve(__dirname, "src/popup.html"),
        background: path.resolve(__dirname, "src/background.js"),
        "content-script": path.resolve(__dirname, "src/content-script.js"),
      },
      preserveEntrySignatures: "strict",

      output: {
        validate: true,
        entryFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
        chunkFileNames: `[name].js`,
        esModule: true,
      },
    },
  },
});
