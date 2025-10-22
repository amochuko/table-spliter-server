SET search_path TO zcash_101_table_spliter;

ALTER TABLE sessions
ADD COLUMN start_time timestamp NOT NULL DEFAULT now(),
ADD COLUMN end_time timestamp NOT NULL DEFAULT now();
