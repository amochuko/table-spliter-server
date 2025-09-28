SET search_path TO zcash_101_table_spliter;

ALTER TABLE sessions
ADD COLUMN description TEXT;
