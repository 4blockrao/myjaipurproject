
-- Check what coupon_type values are allowed
SELECT 
  conname,
  pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conname = 'deals_coupon_type_check';
