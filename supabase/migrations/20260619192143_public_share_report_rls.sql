-- Public share report RLS policies
-- Without these, /r/[slug] (the public, unauthenticated AI visibility report page)
-- could never load any data: the only existing policies on brands/mentions were
-- owner-only ("auth.uid() = user_id"), so anon requests always got zero rows back
-- and the page correctly (but unhelpfully) rendered notFound().
--
-- These are purely additive SELECT-only policies. The pre-existing "_own" ALL
-- policies still fully govern create/update/delete and continue to restrict
-- a brand's full row set (including user_id) to its owner for write operations
-- and for any SELECT the owner performs while authenticated.
--
-- Scope: a brand is only publicly readable once it has a share_slug (which is
-- generated server-side on brand creation / first settings save — see
-- src/app/api/brands/route.ts and src/app/dashboard/settings/page.tsx). No
-- sensitive columns are exposed: the public page's own .select() only ever
-- requests id, name, domain, keywords, competitors — never user_id.

CREATE POLICY brands_public_share_read
  ON public.brands
  FOR SELECT
  TO anon, authenticated
  USING (share_slug IS NOT NULL);

CREATE POLICY mentions_public_share_read
  ON public.mentions
  FOR SELECT
  TO anon, authenticated
  USING (
    brand_id IN (
      SELECT id FROM public.brands WHERE share_slug IS NOT NULL
    )
  );
