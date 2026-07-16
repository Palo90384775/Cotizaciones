
-- Add 'nombre' column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS nombre TEXT;
