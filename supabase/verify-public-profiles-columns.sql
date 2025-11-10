-- Verifica che la vista public_profiles abbia tutti i campi necessari
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'public_profiles'
ORDER BY ordinal_position;

-- Dovremmo vedere:
-- 1. id
-- 2. first_name
-- 3. last_name
-- 4. profile_picture_url
-- 5. full_name

