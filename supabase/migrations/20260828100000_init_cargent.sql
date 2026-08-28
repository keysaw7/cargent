-- Cargent core schema, RLS, storage and private helpers.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to postgres, supabase_admin, supabase_auth_admin;

create type public.card_kind as enum ('agent', 'model');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null,
  bio text not null default '',
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,24}$'),
  constraint profiles_display_name_length check (char_length(display_name) between 2 and 40),
  constraint profiles_bio_length check (char_length(bio) <= 280)
);

create unique index profiles_username_unique on public.profiles (username);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collections_name_length check (char_length(name) between 2 and 60),
  constraint collections_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint collections_description_length check (char_length(description) <= 400),
  constraint collections_owner_slug_unique unique (owner_id, slug)
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections (id) on delete cascade,
  name text not null,
  slug text not null,
  kind public.card_kind not null,
  short_description text not null,
  description text not null default '',
  provider text,
  level integer not null,
  image_path text,
  tags text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cards_name_length check (char_length(name) between 2 and 48),
  constraint cards_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint cards_short_description_length check (char_length(short_description) between 8 and 140),
  constraint cards_description_length check (char_length(description) <= 2000),
  constraint cards_provider_length check (provider is null or char_length(provider) <= 40),
  constraint cards_level_range check (level between 1 and 12),
  constraint cards_tags_limit check (cardinality(tags) <= 8),
  constraint cards_collection_slug_unique unique (collection_id, slug)
);

create table public.card_abilities (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,
  name text not null,
  description text not null default '',
  power integer not null,
  position integer not null,
  created_at timestamptz not null default now(),
  constraint card_abilities_name_length check (char_length(name) between 2 and 40),
  constraint card_abilities_description_length check (char_length(description) <= 180),
  constraint card_abilities_power_range check (power between 1 and 100),
  constraint card_abilities_position_range check (position between 0 and 4),
  constraint card_abilities_card_position_unique unique (card_id, position)
);

create index cards_published_created_idx on public.cards (is_published, created_at desc);
create index cards_kind_level_idx on public.cards (kind, level);
create index collections_public_created_idx on public.collections (is_public, created_at desc);
create index card_abilities_card_id_idx on public.card_abilities (card_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function private.set_updated_at();

create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
  unique_username text;
begin
  requested_username := lower(coalesce(new.raw_user_meta_data->>'username', 'dueliste'));
  requested_username := regexp_replace(requested_username, '[^a-z0-9_]', '', 'g');

  if char_length(requested_username) < 3 then
    requested_username := 'dueliste';
  end if;

  unique_username := requested_username;

  if exists (
    select 1
    from public.profiles
    where username = unique_username
  ) then
    unique_username := requested_username || '_' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    unique_username,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), unique_username)
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

grant execute on function private.handle_new_user() to postgres, supabase_admin, supabase_auth_admin;
grant execute on function private.set_updated_at() to postgres, supabase_admin;

grant usage on schema public to anon, authenticated;
grant select on table public.profiles to anon, authenticated;
grant insert, update on table public.profiles to authenticated;
grant select on table public.collections to anon, authenticated;
grant insert, update, delete on table public.collections to authenticated;
grant select on table public.cards to anon, authenticated;
grant insert, update, delete on table public.cards to authenticated;
grant select on table public.card_abilities to anon, authenticated;
grant insert, update, delete on table public.card_abilities to authenticated;

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.cards enable row level security;
alter table public.card_abilities enable row level security;

create policy "Les profils sont lisibles"
  on public.profiles
  for select
  using (true);

create policy "Un utilisateur crée son profil"
  on public.profiles
  for insert
  with check ((select auth.uid()) = id);

create policy "Un utilisateur met à jour son profil"
  on public.profiles
  for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Les collections publiques sont lisibles"
  on public.collections
  for select
  using (is_public = true or owner_id = (select auth.uid()));

create policy "Le propriétaire crée une collection"
  on public.collections
  for insert
  with check (owner_id = (select auth.uid()));

create policy "Le propriétaire met à jour une collection"
  on public.collections
  for update
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Le propriétaire supprime une collection"
  on public.collections
  for delete
  using (owner_id = (select auth.uid()));

create policy "Les cartes publiées d'une collection visible sont lisibles"
  on public.cards
  for select
  using (
    exists (
      select 1
      from public.collections c
      where c.id = cards.collection_id
        and (c.is_public = true or c.owner_id = (select auth.uid()))
        and (cards.is_published = true or c.owner_id = (select auth.uid()))
    )
  );

create policy "Le propriétaire crée une carte"
  on public.cards
  for insert
  with check (
    exists (
      select 1
      from public.collections c
      where c.id = cards.collection_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Le propriétaire met à jour une carte"
  on public.cards
  for update
  using (
    exists (
      select 1
      from public.collections c
      where c.id = cards.collection_id
        and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.collections c
      where c.id = cards.collection_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Le propriétaire supprime une carte"
  on public.cards
  for delete
  using (
    exists (
      select 1
      from public.collections c
      where c.id = cards.collection_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Les capacités suivent la visibilité de la carte"
  on public.card_abilities
  for select
  using (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_abilities.card_id
        and (c.is_public = true or c.owner_id = (select auth.uid()))
        and (card.is_published = true or c.owner_id = (select auth.uid()))
    )
  );

create policy "Le propriétaire ajoute une capacité"
  on public.card_abilities
  for insert
  with check (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_abilities.card_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Le propriétaire met à jour une capacité"
  on public.card_abilities
  for update
  using (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_abilities.card_id
        and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_abilities.card_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Le propriétaire supprime une capacité"
  on public.card_abilities
  for delete
  using (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_abilities.card_id
        and c.owner_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-art',
  'card-art',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Les illustrations de cartes sont publiques"
  on storage.objects
  for select
  using (bucket_id = 'card-art');

create policy "Un utilisateur dépose dans son dossier"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'card-art'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

create policy "Un utilisateur remplace dans son dossier"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'card-art'
    and split_part(name, '/', 1) = (select auth.uid())::text
  )
  with check (
    bucket_id = 'card-art'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

create policy "Un utilisateur supprime dans son dossier"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'card-art'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );
