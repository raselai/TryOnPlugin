import { defineConfig } from "vite";

const CDN_BASE = process.env.CDN_BASE || "/";

export default defineConfig({
  server: {
    port: 5173
  },
  base: CDN_BASE,
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        loader: "src/loader.ts",
        widget: "src/main.ts"
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "[name].[ext]"
      }
    }
  },
  define: {
    // Inject build-time version for cache busting
    __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0")
  }
});
