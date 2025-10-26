-- Check for triggers on bookings table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'bookings'
ORDER BY trigger_name;

-- Check for functions that might be called by triggers
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition LIKE '%bookings%'
   OR routine_name LIKE '%booking%';
