import { defineConfig } from "cypress";
import mysql from "mysql2/promise";
import fs from "fs";
import config from "./src/config/config";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on) {
      on("task", {
        async resetDb() {
          const connection = await mysql.createConnection(config.database);

          const sql = fs.readFileSync("cypress/db/seed.sql", "utf8");
          await connection.query(sql);
          await connection.end();

          return null;
        },
      });
    },
  },
});
