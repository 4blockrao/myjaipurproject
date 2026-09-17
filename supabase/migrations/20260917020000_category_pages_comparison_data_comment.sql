-- Documents the comparison_data JSON shape as a real, durable, queryable
-- Postgres comment (information_schema.columns / pg_description), not just
-- a code comment in a file someone has to know to go find. The column
-- itself is generic jsonb - nothing in the schema enforces this shape - so
-- this is the contract until/unless a CHECK constraint is added later.
--
-- Shape: { headers: string[], rows: string[][] } - consumed by
-- renderComparisonTable() in supabase/functions/category-ssr/index.ts.
-- Any content authored against comparison_data that doesn't match this
-- shape will silently render nothing (renderComparisonTable returns "" for
-- anything that doesn't have both fields as arrays) rather than error -
-- worth knowing before assuming a mismatch would be caught.

COMMENT ON COLUMN public.category_pages.comparison_data IS
  'JSON shape: { headers: string[], rows: string[][] }. Not enforced by a CHECK constraint - documented here as the real contract. Rendered by renderComparisonTable() in supabase/functions/category-ssr/index.ts; a value that does not match this shape renders as nothing, silently, not an error.';
