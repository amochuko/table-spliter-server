SET search_path TO zcash_101_table_spliter;

ALTER TABLE sessions
ADD COLUMN qr_data_url VARCHAR(50)
ADD COLUMN invite_url TEXT
