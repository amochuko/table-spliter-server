SET search_path TO zcash_101_table_spliter;

ALTER TABLE participants
ADD COLUMN email VARCHAR(50) UNIQUE NOT NULL;
