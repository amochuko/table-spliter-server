/**
 * This ensures tests don’t leak data between each other.
 */

import "reflect-metadata";
import { sql } from "./src/common/database/sqlConnection";

/**
 * Dynamically truncates all tables in the `inventory` schema.
 * This is helpful in automatically adapting to when new test tables
 * are added without updating this function.
 */
export async function clearTestTable() {
  const result = await sql({
    text: `
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'inventory' AND tablename != '_migrations';`,
  });

  const tables = result.rows.map((row) => `inventory.${row.tablename}`);

  if (tables.length === 0) {
    console.warn("No tables found to truncate.");
    return;
  }

  console.log("[Tables to be migrated]:", tables.join(", "));
  await sql({
    text: `TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE;`,
  });
}

beforeEach(async () => {
  console.log("⚠️ Truncating suppliers table...");
  await clearTestTable();
});
