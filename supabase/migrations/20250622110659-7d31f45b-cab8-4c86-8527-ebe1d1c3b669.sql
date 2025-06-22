
-- Check existing coupon_type values in the deals table
SELECT DISTINCT coupon_type FROM public.deals WHERE coupon_type IS NOT NULL;

-- Check table constraints using the correct column
SELECT 
  conname, 
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.deals'::regclass 
AND contype = 'c';
