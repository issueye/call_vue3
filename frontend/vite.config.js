import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    cors: true,
    proxy: {
      "/local/api": {
        target: "http://0.0.0.0:21999",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/local\/api/, "/local/api"),
      },
      "/lime/api": {
        target: "http://0.0.0.0:21999",
        // target: "https://wjlcsq.mcyyhealth.com/triage",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lime\/api/, "/lime/api"),
      },
      "/static": {
        target: "http://0.0.0.0:21999",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/static/, "/static"),
      },
    },
  },
  // Wails 构建配置
  build: {
    outDir: resolve(__dirname, "../dist"),
    emptyOutDir: true,
  },
});
