import "dotenv/config";
import fs from "fs";
import path from "path";
import { createApp } from "./app";
import { env } from "./config/env";

fs.mkdirSync(path.resolve(env.UPLOAD_DIR), { recursive: true });

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Carta API listening on ${env.APP_URL} (port ${env.PORT})`);
});
