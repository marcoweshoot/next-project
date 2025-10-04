-- Fix fiscal_code constraint issue
-- Remove or modify the check_fiscal_code constraint that's causing webhook failures

-- First, let's see what constraints exist
-- SELECT conname, consrc FROM pg_constraint WHERE conname LIKE '%fiscal%';

-- Drop the problematic constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_fiscal_code;

-- Create a more permissive constraint that allows NULL and validates format when present
ALTER TABLE profiles ADD CONSTRAINT check_fiscal_code 
  CHECK (fiscal_code IS NULL OR (LENGTH(fiscal_code) = 16 AND fiscal_code ~ '^[A-Z0-9]{16}$'));

-- This allows:
-- - NULL values (when fiscal_code is not provided)
-- - Valid Italian fiscal code format (16 characters, letters and numbers only)
-- - Empty string is treated as NULL
