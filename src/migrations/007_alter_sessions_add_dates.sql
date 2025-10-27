SET search_path TO zcash_101_table_spliter;

ALTER TABLE sessions
ADD COLUMN start_date timestamp with time zone NOT NULL DEFAULT now(),
ADD COLUMN end_date timestamp with time zone NOT NULL DEFAULT now();
