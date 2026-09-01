-- Persist generated card art and in-progress card form drafts.

create table public.image_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  prompt text not null,
  image_path text not null,
  created_at timestamptz not null default now(),
  constraint image_generations_prompt_length check (char_length(prompt) between 8 and 800),
  constraint image_generations_image_path_length check (char_length(image_path) between 1 and 240),
  constraint image_generations_image_path_unique unique (image_path)
);

create index image_generations_user_created_idx
  on public.image_generations (user_id, created_at desc);

create table public.card_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  card_id uuid references public.cards (id) on delete cascade,
  name text not null default '',
  kind public.card_kind not null default 'agent',
  template public.card_template not null default 'classique',
  provider text not null default '',
  level integer not null default 4,
  short_description text not null default '',
  description text not null default '',
  tags text[] not null default '{}',
  abilities jsonb not null default '[]',
  image_path text,
  generate_prompt text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint card_drafts_name_length check (char_length(name) <= 48),
  constraint card_drafts_provider_length check (char_length(provider) <= 40),
  constraint card_drafts_level_range check (level between 1 and 12),
  constraint card_drafts_short_description_length check (char_length(short_description) <= 140),
  constraint card_drafts_description_length check (char_length(description) <= 2000),
  constraint card_drafts_tags_limit check (cardinality(tags) <= 8),
  constraint card_drafts_generate_prompt_length check (char_length(generate_prompt) <= 800),
  constraint card_drafts_image_path_length check (image_path is null or char_length(image_path) <= 240)
);

create unique index card_drafts_new_unique
  on public.card_drafts (user_id, collection_id)
  where card_id is null;

create unique index card_drafts_edit_unique
  on public.card_drafts (card_id)
  where card_id is not null;

create index card_drafts_user_collection_idx
  on public.card_drafts (user_id, collection_id);

create trigger card_drafts_set_updated_at
  before update on public.card_drafts
  for each row execute function private.set_updated_at();

revoke all on table public.image_generations from public, anon;
revoke all on table public.card_drafts from public, anon;
grant select, insert, delete on table public.image_generations to authenticated;
grant select, insert, update, delete on table public.card_drafts to authenticated;

alter table public.image_generations enable row level security;
alter table public.card_drafts enable row level security;

create policy "Le propriétaire lit ses générations"
  on public.image_generations
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Le propriétaire enregistre une génération"
  on public.image_generations
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Le propriétaire supprime une génération"
  on public.image_generations
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Le propriétaire lit un brouillon"
  on public.card_drafts
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.collections c
      where c.id = card_drafts.collection_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Le propriétaire crée un brouillon"
  on public.card_drafts
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.collections c
      where c.id = card_drafts.collection_id
        and c.owner_id = (select auth.uid())
    )
    and (
      card_id is null
      or exists (
        select 1
        from public.cards card
        join public.collections c on c.id = card.collection_id
        where card.id = card_drafts.card_id
          and card.collection_id = card_drafts.collection_id
          and c.owner_id = (select auth.uid())
      )
    )
  );

create policy "Le propriétaire met à jour un brouillon"
  on public.card_drafts
  for update
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.collections c
      where c.id = card_drafts.collection_id
        and c.owner_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.collections c
      where c.id = card_drafts.collection_id
        and c.owner_id = (select auth.uid())
    )
    and (
      card_id is null
      or exists (
        select 1
        from public.cards card
        join public.collections c on c.id = card.collection_id
        where card.id = card_drafts.card_id
          and card.collection_id = card_drafts.collection_id
          and c.owner_id = (select auth.uid())
      )
    )
  );

create policy "Le propriétaire supprime un brouillon"
  on public.card_drafts
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.collections c
      where c.id = card_drafts.collection_id
        and c.owner_id = (select auth.uid())
    )
  );
