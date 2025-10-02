-- Fix profiles table schema
-- Add missing columns to profiles table

-- Add full_name column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add other missing columns that might be needed
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS fiscal_code TEXT,
ADD COLUMN IF NOT EXISTS vat_number TEXT,
ADD COLUMN IF NOT EXISTS pec_email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Update existing records to have full_name if they don't
UPDATE profiles 
SET full_name = COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')
WHERE full_name IS NULL OR full_name = '';

-- Create index on full_name for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;
