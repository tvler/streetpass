import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
    emptyOutDir: true,
    lib: {
      entry: ["src/background.js"],
      formats: ["es"],
    },
    minify: false,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "src/popup.html"),
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        esModule: true,
      },
      plugins: false,
    },
  },
});
