-- Check if there are any triggers on bookings table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'bookings';

-- Check if there are any functions that might be called
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%booking%' 
   OR routine_definition LIKE '%bookings%';
