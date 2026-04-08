import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    baseURL: "http://localhost:4173",
    headless: true,
  },
  webServer: {
    command: "npm run dev -- --host --port 4173",
    port: 4173,
    reuseExistingServer: true,
    timeout: 120000,
  },
  testDir: "tests/e2e",
});

