SET search_path TO zcash_101_table_spliter;
ALTER TABLE participants
DROP CONSTRAINT participants_email_key;
