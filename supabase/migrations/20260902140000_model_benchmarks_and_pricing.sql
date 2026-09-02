-- Model card categories, benchmark scores and optional pricing.

create type public.model_category as enum ('code', 'image', 'video');

alter table public.cards
  add column model_category public.model_category;

alter table public.cards
  add constraint cards_model_category_kind check (
    (kind = 'agent' and model_category is null)
    or kind = 'model'
  );

alter table public.card_drafts
  add column model_category public.model_category,
  add column benchmarks jsonb not null default '[]',
  add column pricing jsonb not null default '{}';

create table public.card_benchmarks (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,
  benchmark_key text not null,
  score numeric not null,
  benchmark_version text not null,
  source_url text not null,
  measured_at date not null,
  created_at timestamptz not null default now(),
  constraint card_benchmarks_key_length check (char_length(benchmark_key) between 2 and 40),
  constraint card_benchmarks_version_length check (char_length(benchmark_version) between 1 and 40),
  constraint card_benchmarks_source_url_length check (char_length(source_url) between 12 and 240),
  constraint card_benchmarks_source_url_https check (source_url like 'https://%'),
  constraint card_benchmarks_score_finite check (score = score),
  constraint card_benchmarks_card_key_unique unique (card_id, benchmark_key)
);

create index card_benchmarks_card_id_idx on public.card_benchmarks (card_id);

create table public.card_model_pricing (
  card_id uuid primary key references public.cards (id) on delete cascade,
  input_usd_per_million_tokens numeric,
  output_usd_per_million_tokens numeric,
  image_usd numeric,
  video_second_usd numeric,
  source_url text,
  checked_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint card_model_pricing_input_nonneg check (
    input_usd_per_million_tokens is null or input_usd_per_million_tokens >= 0
  ),
  constraint card_model_pricing_output_nonneg check (
    output_usd_per_million_tokens is null or output_usd_per_million_tokens >= 0
  ),
  constraint card_model_pricing_image_nonneg check (
    image_usd is null or image_usd >= 0
  ),
  constraint card_model_pricing_video_nonneg check (
    video_second_usd is null or video_second_usd >= 0
  ),
  constraint card_model_pricing_has_price check (
    input_usd_per_million_tokens is not null
    or output_usd_per_million_tokens is not null
    or image_usd is not null
    or video_second_usd is not null
  ),
  constraint card_model_pricing_source_url_length check (
    source_url is null or char_length(source_url) between 12 and 240
  ),
  constraint card_model_pricing_source_url_https check (
    source_url is null or source_url like 'https://%'
  )
);

create trigger card_model_pricing_set_updated_at
  before update on public.card_model_pricing
  for each row execute function private.set_updated_at();

grant select on table public.card_benchmarks to anon, authenticated;
grant insert, update, delete on table public.card_benchmarks to authenticated;
grant select on table public.card_model_pricing to anon, authenticated;
grant insert, update, delete on table public.card_model_pricing to authenticated;

alter table public.card_benchmarks enable row level security;
alter table public.card_model_pricing enable row level security;

create policy "Les scores suivent la visibilité de la carte"
  on public.card_benchmarks
  for select
  using (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_benchmarks.card_id
        and (c.is_public = true or c.owner_id = (select auth.uid()))
        and (card.is_published = true or c.owner_id = (select auth.uid()))
    )
  );

create policy "Le propriétaire ajoute un score"
  on public.card_benchmarks
  for insert
  with check (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_benchmarks.card_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Le propriétaire met à jour un score"
  on public.card_benchmarks
  for update
  using (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_benchmarks.card_id
        and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_benchmarks.card_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Le propriétaire supprime un score"
  on public.card_benchmarks
  for delete
  using (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_benchmarks.card_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Les tarifs suivent la visibilité de la carte"
  on public.card_model_pricing
  for select
  using (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_model_pricing.card_id
        and (c.is_public = true or c.owner_id = (select auth.uid()))
        and (card.is_published = true or c.owner_id = (select auth.uid()))
    )
  );

create policy "Le propriétaire ajoute un tarif"
  on public.card_model_pricing
  for insert
  with check (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_model_pricing.card_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Le propriétaire met à jour un tarif"
  on public.card_model_pricing
  for update
  using (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_model_pricing.card_id
        and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_model_pricing.card_id
        and c.owner_id = (select auth.uid())
    )
  );

create policy "Le propriétaire supprime un tarif"
  on public.card_model_pricing
  for delete
  using (
    exists (
      select 1
      from public.cards card
      join public.collections c on c.id = card.collection_id
      where card.id = card_model_pricing.card_id
        and c.owner_id = (select auth.uid())
    )
  );
