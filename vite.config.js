import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_TARGET || "http://localhost:8080";

  return {
    // GitHub Pages project site path (https://<user>.github.io/calisthenics/)
    base: "/",
    plugins: [react()],
    test: {
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      globals: true,
      exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
    },
    server: {
      proxy: {
        // Dev: proxy API calls sang PHP server local
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
    },
  };
});
