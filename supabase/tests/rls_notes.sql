-- RLS matrix for Cargent.
-- Anonymous: can SELECT public profiles, public collections, published cards in public collections, and public card art.
-- Anonymous: cannot INSERT/UPDATE/DELETE any table or storage object.
-- Authenticated owner: full CRUD on own collections, cards, abilities, profile, and files under {auth.uid()}/.
-- Authenticated peer: cannot mutate another user's collections, cards, abilities, profile or storage folder.
-- Private collections and unpublished cards remain invisible to everyone except their owner.
select 1;
