-- Update all active deals to approved status so they show in the app
UPDATE public.deals 
SET approval_status = 'approved' 
WHERE is_active = true AND approval_status = 'draft';