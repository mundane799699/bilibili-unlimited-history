import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 禁用代码压缩，方便调试
    minify: false,
    // 禁用 CSS 代码分割
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"),
        history: resolve(__dirname, "src/history/index.html"),
        background: resolve(__dirname, "src/background/index.ts"),
        content: resolve(__dirname, "src/content/index.ts"),
      },
      output: {
        // 修改输出路径，直接输出到 dist 根目录
        entryFileNames: "[name]/index.js",
        chunkFileNames: "chunks/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
            return "assets/index.css";
          }
          return "assets/[name].[hash][extname]";
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    // 禁用开发服务器
    open: false,
  },
});
