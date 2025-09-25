CREATE SCHEMA IF NOT EXISTS zcash_101_table_spliter;
SET search_path TO zcash_101_table_spliter;

CREATE TABLE IF NOT EXISTS zcash_101_table_spliter.migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP NOT NULL DEFAULT NOW()
);
