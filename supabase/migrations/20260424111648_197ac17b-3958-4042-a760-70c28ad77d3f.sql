alter table public.venues enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'venues'
      and policyname = 'Anyone can view published venues'
  ) then
    create policy "Anyone can view published venues"
    on public.venues
    for select
    to public
    using (
      status = 'published' and coalesce(editorial_status, 'published') = 'published'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'venues'
      and policyname = 'Admins can manage venues'
  ) then
    create policy "Admins can manage venues"
    on public.venues
    for all
    to public
    using (public.has_role(auth.uid(), 'admin'))
    with check (public.has_role(auth.uid(), 'admin'));
  end if;
end $$;