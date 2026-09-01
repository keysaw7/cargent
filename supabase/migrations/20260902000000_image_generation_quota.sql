-- Daily transactional quota for card art generation.

create table public.image_generation_quotas (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  used integer not null default 0,
  constraint image_generation_quotas_used_nonnegative check (used >= 0),
  primary key (user_id, day)
);

revoke all on table public.image_generation_quotas from anon, authenticated;
alter table public.image_generation_quotas enable row level security;

create or replace function private.consume_image_generation_quota()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_used integer;
  daily_limit constant integer := 20;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  insert into public.image_generation_quotas as quotas (user_id, day, used)
  values ((select auth.uid()), (timezone('utc', now()))::date, 1)
  on conflict (user_id, day)
  do update set used = quotas.used + 1
  returning used into current_used;

  if current_used > daily_limit then
    raise exception 'quota_exceeded' using errcode = 'P0001';
  end if;

  return daily_limit - current_used;
end;
$$;

create or replace function public.consume_image_generation_quota()
returns integer
language sql
security invoker
set search_path = ''
as $$
  select private.consume_image_generation_quota();
$$;

revoke all on function private.consume_image_generation_quota() from public;
revoke all on function public.consume_image_generation_quota() from public;
grant usage on schema private to authenticated;
grant execute on function private.consume_image_generation_quota() to authenticated;
grant execute on function public.consume_image_generation_quota() to authenticated;
