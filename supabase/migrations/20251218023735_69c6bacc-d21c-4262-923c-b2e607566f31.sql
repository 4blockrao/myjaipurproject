-- Grant admin role to smith@gmail.com
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT p.id, 'admin'::app_role, p.id
FROM public.profiles p
WHERE p.email = 'smith@gmail.com'
ON CONFLICT (user_id, role) DO UPDATE SET
  is_active = true,
  updated_at = now();