import dotenv from "dotenv";
dotenv.config();

const envs = {
  COOKIE_SECRET: String(process.env.COOKIE_SECRET),
  JWT_SECRET: String(process.env.JWT_SECRET),
  APP_SCHEME: "tabsplit://",

  // POSTGRESS
  PGHOST_LOCAL: process.env.PGHOST_LOCAL,
  PGUSER_LOCAL: process.env.PGUSER_LOCAL,
  PGDATABASE_LOCAL: process.env.PGDATABASE_LOCAL,
  PGPASSWORD_LOCAL: process.env.PGPASSWORD_LOCAL,
  PGPORT_LOCAL: Number(process.env.PGPORT_LOCAL),
  PGDB_PRO_CONNECTION_STRING: process.env.PGDB_PRO_CONNECTION_STRING,
  PGDB_DEV_CONNECTION_STRING: process.env.PGDB_DEV_CONNECTION_STRING,
  PGDB_TEST_CONNECTION_STRING: process.env.PGDB_TEST_CONNECTION_STRING,
};

export default envs;
