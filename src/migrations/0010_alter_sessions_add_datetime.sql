SET search_path TO zcash_101_table_spliter;

ALTER TABLE sessions
ADD COLUMN start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
ADD COLUMN end_datetime TIMESTAMP WITH TIME ZONE NOT NULL;

-- Note: The above syntax may vary based on the SQL database being used.
ALTER TABLE sessions
DROP COLUMN start_time,
DROP COLUMN end_time;
