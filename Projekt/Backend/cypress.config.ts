import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: "http://localhost:3000",
    env: {
      apiUrl: "/napicsepp",
    },
  },
});
