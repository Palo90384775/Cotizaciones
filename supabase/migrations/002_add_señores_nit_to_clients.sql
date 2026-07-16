
-- Add señores and nit columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS señores TEXT,
ADD COLUMN IF NOT EXISTS nit TEXT;
