-- Store four optional effort scores per benchmark instead of a single value.

alter table public.card_benchmarks
  add column low_score numeric,
  add column medium_score numeric,
  add column high_score numeric,
  add column xhigh_score numeric;

update public.card_benchmarks
set xhigh_score = score
where xhigh_score is null;

alter table public.card_benchmarks
  drop constraint card_benchmarks_score_finite,
  drop column score;

alter table public.card_benchmarks
  add constraint card_benchmarks_has_effort check (
    low_score is not null
    or medium_score is not null
    or high_score is not null
    or xhigh_score is not null
  ),
  add constraint card_benchmarks_low_finite check (low_score is null or low_score = low_score),
  add constraint card_benchmarks_medium_finite check (medium_score is null or medium_score = medium_score),
  add constraint card_benchmarks_high_finite check (high_score is null or high_score = high_score),
  add constraint card_benchmarks_xhigh_finite check (xhigh_score is null or xhigh_score = xhigh_score),
  add constraint card_benchmarks_efforts_monotonic check (
    (low_score is null or medium_score is null or low_score <= medium_score)
    and (low_score is null or high_score is null or low_score <= high_score)
    and (low_score is null or xhigh_score is null or low_score <= xhigh_score)
    and (medium_score is null or high_score is null or medium_score <= high_score)
    and (medium_score is null or xhigh_score is null or medium_score <= xhigh_score)
    and (high_score is null or xhigh_score is null or high_score <= xhigh_score)
  );
