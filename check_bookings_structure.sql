-- Check bookings table structure and constraints
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    constraint_name, 
    constraint_type, 
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'bookings';

-- Check indexes
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'bookings';
