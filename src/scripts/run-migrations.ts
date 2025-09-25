const childProcess = require("child_process");
const fs = require("node:fs");
const path = require("node:path");
import { DATABASE_URL, sql } from "../common/database/sqlConnection";

const MIGRATION_DIR = "./src/migrations";

async function createMigrationTable(filePath: string) {
  if (!DATABASE_URL) {
    console.error("DATABASE_URL not set!");
    process.exit(1);
  }

  const result = await sql({
    text: `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = $1`,
    params: ["zcash_101_table_spliter"],
  });

  const includesMigrationsTable = result.rows
    .map((r) => r.tablename)
    .includes("migrations");

  if (!includesMigrationsTable) {
    const command = `psql ${DATABASE_URL} -f ${filePath}`;
    childProcess.execSync(command, {
      stdio: "inherit",
    });
  }
}

async function runMigration(filePath: string) {
  await createMigrationTable(filePath);

  const files = fs
    .readdirSync(path.resolve(MIGRATION_DIR))
    .filter((file: any) => file.endsWith(".sql"))
    .slice(1)
    .sort();

  let numOfMigratedFile = 0;
  try {
    for (const file of files) {
      const [name] = file.split(".sql");

      const res = await sql({
        text: `SELECT * FROM zcash_101_table_spliter.migrations WHERE name = $1`,
        params: [name],
      });

      if (!res.rowCount) {
        const filePath = path.join(MIGRATION_DIR, file);

        childProcess.execSync(`psql ${DATABASE_URL} -f ${filePath}`, {
          stdio: "inherit",
        });

        await sql({
          text: `INSERT INTO zcash_101_table_spliter.migrations (name) VALUES ($1) RETURNING *`,
          params: [name],
        });

        console.log(`✅ ${name} was migrated`);
        numOfMigratedFile++;
      }
    }

    const report =
      numOfMigratedFile > 0
        ? `\n${numOfMigratedFile} flle${
            numOfMigratedFile > 1 ? "s" : null
          } migrated successfully `
        : `\nNo new file to migrate.`;

    console.log(report);
  } catch (err) {
    console.error("Error on query: ", err);
  }
}

async function main() {
  try {
    await runMigration("src/migrations/000_create_migrations_table.sql");
  } catch (err) {
    console.error(err);
  }
}

main().finally(async () => {
  process.exit(1);
});
