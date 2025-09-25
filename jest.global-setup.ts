import dotenv from "dotenv";
dotenv.config({ path: "./.env.test" });

import { runDBMigration } from "./db-migrations";
import env from "./src/common/utils/env";

const testConnStr = env.PGDB_TEST_CONNECTION_STRING;
const nodeEnv = process.env.NODE_ENV;

export default async () => {
  console.log({ nodeEnv, testConnStr });

  await runDBMigration();
};
