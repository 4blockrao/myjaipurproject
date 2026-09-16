-- Adds a distinct 'author' role, separate from 'admin', for the editorial
-- authoring system being built on `articles` / `news_articles`.
--
-- This is its OWN migration file, deliberately: `ALTER TYPE ... ADD VALUE`
-- cannot be used in the same transaction/migration as a policy that
-- references the new value (Postgres will reject it with "unsafe use of new
-- value of enum type" if you try). Any migration that writes
-- `has_role(auth.uid(), 'author')` must run in a LATER migration than this
-- one, never combined with it.
--
-- IF NOT EXISTS makes this safe to re-run; matches the idempotency style
-- already used elsewhere in this migration history (e.g.
-- 20260423022804_...sql's `IF NOT EXISTS` policy guard).

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'author';
