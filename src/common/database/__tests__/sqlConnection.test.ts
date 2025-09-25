import pg from "pg";
import env from "../../utils/env";
import {  dbClient } from "../sqlConnection";

jest.mock("pg"); // Mock the 'postgres' module

describe.only("Postgres connection config", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should use the correct dev environment settings for dev", async () => {
    // Set the environment to 'development'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (process.env as any).NODE_ENV = "development";
    process.env.PGHOST_LOCAL = "localhost";
    process.env.PGUSER_LOCAL = "dev_user";
    process.env.PGDATABASE_LOCAL = "dev_db";
    process.env.PGPASSWORD_LOCAL = "dev_password";
    process.env.PGPORT_LOCAL = "5432";

    jest.isolateModules(() => {
      // Requiring the sqlConnection here ensures we load the correct environment settings

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("../sqlConnection");
    });

    await dbClient.getPool().connect();
    expect(pg.Pool).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "localhost",
        user: "dev_user",
        database: "dev_db",
        password: "dev_password",
        port: 5432,
        ssl: false,
      })
    );
  });

  xit("should use the correct production environment settings for production", async () => {
    // Set the environment to 'production'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (process.env as any).NODE_ENV = "production";
    process.env.PGHOST = "prod_host";
    process.env.PGUSER = "prod_user";
    process.env.PGDATABASE = "prod_db";
    process.env.PGPASSWORD = "prod_password";
    process.env.PGPORT = "5432";

    jest.isolateModules(() => {
      // Requiring the sqlConnection here ensures we load the correct environment settings

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("../sqlConnection");
    });

    await dbClient.getPool().connect();
    expect(pg.Pool).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionString: env.PGDB_TEST_CONNECTION_STRING,
      })
    );
  });
});
