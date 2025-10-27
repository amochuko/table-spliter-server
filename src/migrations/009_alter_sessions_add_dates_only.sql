SET search_path TO zcash_101_table_spliter;

ALTER TABLE sessions
ALTER COLUMN start_date TYPE DATE using start_date::DATE,
ALTER COLUMN end_date TYPE DATE using end_date::DATE;

-- Note: The above syntax may vary based on the SQL database being used.
