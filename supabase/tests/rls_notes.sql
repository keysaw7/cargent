-- RLS matrix for Cargent.
-- Anonymous: can SELECT public profiles, public collections, published cards in public collections, and public card art.
-- Anonymous: cannot INSERT/UPDATE/DELETE any table or storage object.
-- Authenticated owner: full CRUD on own collections, cards, abilities, profile, and files under {auth.uid()}/.
-- Image generation quotas: no direct table access; authenticated users consume quota only via public.consume_image_generation_quota().
-- Image generations: authenticated owner can SELECT/INSERT/DELETE own rows; anonymous has no access.
-- Card drafts: authenticated owner can CRUD own drafts on owned collections; anonymous has no access.
-- Authenticated peer: cannot mutate another user's collections, cards, abilities, drafts, generations, profile or storage folder.
-- Private collections and unpublished cards remain invisible to everyone except their owner.
select 1;
