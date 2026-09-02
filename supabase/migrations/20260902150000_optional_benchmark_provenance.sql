-- Optional benchmark provenance, and drop unused pricing source fields.

alter table public.card_benchmarks
  alter column benchmark_version drop not null,
  alter column source_url drop not null,
  alter column measured_at drop not null;

alter table public.card_benchmarks
  drop constraint if exists card_benchmarks_version_length,
  drop constraint if exists card_benchmarks_source_url_length,
  drop constraint if exists card_benchmarks_source_url_https;

alter table public.card_benchmarks
  add constraint card_benchmarks_version_length check (
    benchmark_version is null or char_length(benchmark_version) between 1 and 40
  ),
  add constraint card_benchmarks_source_url_length check (
    source_url is null or char_length(source_url) between 12 and 240
  ),
  add constraint card_benchmarks_source_url_https check (
    source_url is null or source_url like 'https://%'
  );

alter table public.card_model_pricing
  drop constraint if exists card_model_pricing_source_url_length,
  drop constraint if exists card_model_pricing_source_url_https;

alter table public.card_model_pricing
  drop column if exists source_url,
  drop column if exists checked_at;
