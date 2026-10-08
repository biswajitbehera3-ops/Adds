import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@config": path.resolve(__dirname, "salon.config.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    env: { DATABASE_URL: "file:./test.db", WHATSAPP_TOKEN: "", WHATSAPP_PHONE_NUMBER_ID: "" },
    globalSetup: "./tests/global-setup.ts",
    fileParallelism: false,
  },
});
