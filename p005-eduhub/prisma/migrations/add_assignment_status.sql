-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS status VARCHAR(10) DEFAULT 'OPEN';
UPDATE assignments SET status = 'OPEN' WHERE status IS NULL;
