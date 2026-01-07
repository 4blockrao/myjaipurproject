-- Add policy for admins to create deals without restrictions
CREATE POLICY "Admins can create any deal"
ON public.deals
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to update any deal
CREATE POLICY "Admins can update any deal"
ON public.deals
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to delete any deal  
CREATE POLICY "Admins can delete any deal"
ON public.deals
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));