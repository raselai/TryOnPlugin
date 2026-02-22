import { defineConfig } from "vite";

const CDN_BASE = process.env.CDN_BASE || "/";
const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  server: {
    port: 5173
  },
  base: CDN_BASE,
  build: {
    outDir: "dist",
    sourcemap: isProd ? "hidden" : true,
    minify: "esbuild",
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
    __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0")
  }
});
