-- New table for the /categories/:slug citywide-reference system (24 of the
-- 31 research-backed content categories). Deliberately NOT an extension of
-- locality_category_pages (that table's shape - title+description stub, no
-- FAQ/comparison/author, thin templated content - is the mistake this is
-- meant to avoid) and NOT built on categories' own unused
-- seo_content/meta_title/h1_override columns (confirmed 0 of 26 rows
-- populated, 2026-09-17 - same vestigial-schema pattern as everywhere else
-- in this project, not something to build on).
--
-- editorial_status deliberately omitted, checked before writing this file:
-- on `events` it's genuinely live (real 1267/355 draft-vs-published split,
-- referenced directly in EventEditor.tsx/EventsManagement.tsx and the
-- scrape/import pipeline) - but on `merchants` it's vestigial (the real
-- admin UI, MerchantsManagement.tsx, gates on a different field entirely,
-- approval_status; cross-tabbing the two on live data shows 18 merchants
-- with editorial_status='draft' while status='published' simultaneously -
-- incoherent, confirming nothing keeps it in sync). category_pages has no
-- scrape-then-import pipeline the way events does, so there's no case here
-- for a status field distinct from `status` itself - `status` +
-- `is_indexable` + `published_at` is the part of the merchants/events
-- pattern that's unambiguously real on both tables; that's what's kept.

CREATE TABLE public.category_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id),
  slug text NOT NULL UNIQUE,

  title text NOT NULL,
  meta_title text,
  meta_description text,
  canonical_url text,

  -- Real direct-answer content, not a templated sentence - the
  -- locality_category_pages mistake this table exists to avoid repeating.
  intro text NOT NULL,

  -- JSONB, not a normalized child table. Checked for a working precedent
  -- before choosing: `locality_comparisons` exists as a separate table but
  -- has 0 rows and is never queried by locality-ssr - same unused-schema
  -- pattern as categories.seo_content, not a real precedent. The one
  -- genuinely-proven pattern for page-owned structured content in this
  -- schema is `localities.faq_json` (JSONB directly on the table, real
  -- authored content, confirmed rendering live FAQPage schema this
  -- session) - matching that, not the unused child-table shape.
  comparison_data jsonb,
  faq_json jsonb,  -- [{question, answer}, ...] - same shape as localities.faq_json

  author_id uuid REFERENCES public.authors(id),

  status text NOT NULL DEFAULT 'draft',
  is_indexable boolean NOT NULL DEFAULT false,
  published_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX category_pages_category_id_idx ON public.category_pages(category_id);
CREATE INDEX category_pages_status_indexable_idx ON public.category_pages(status, is_indexable);

ALTER TABLE public.category_pages ENABLE ROW LEVEL SECURITY;
