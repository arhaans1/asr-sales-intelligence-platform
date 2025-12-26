/*
# Add email and mobile to prospects

This migration adds email and mobile columns to the prospects table.
*/

ALTER TABLE prospects
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS mobile text;
