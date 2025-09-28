SET search_path TO zcash_101_table_spliter;

ALTER TABLE users
ADD COLUMN email TEXT UNIQUE;
