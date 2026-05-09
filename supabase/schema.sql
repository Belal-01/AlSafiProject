create extension if not exists "pgcrypto";

create table if not exists public.currencies (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null,
  target_currency text not null,
  buy_price text not null,
  sell_price text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id integer primary key default 1,
  ticker_text text not null default 'شركة الصافي للصرافة والحوالات ترحب بكم - يتم تحديث الاسعار بشكل مباشر',
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists currencies_set_updated_at on public.currencies;
create trigger currencies_set_updated_at
before update on public.currencies
for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

alter table public.currencies replica identity full;
alter table public.settings replica identity full;

alter publication supabase_realtime add table public.currencies;
alter publication supabase_realtime add table public.settings;

insert into public.settings (id, ticker_text)
values (1, 'شركة الصافي للصرافة والحوالات ترحب بكم - يتم تحديث الاسعار بشكل مباشر')
on conflict (id) do nothing;

insert into public.currencies
  (base_currency, target_currency, buy_price, sell_price, sort_order, is_visible)
values
  ('دولار', 'سوري', '14500', '14600', 1, true),
  ('يورو', 'سوري', '15700', '15850', 2, true),
  ('ليرة تركية', 'سوري', '455', '465', 3, true),
  ('ريال سعودي', 'سوري', '3860', '3900', 4, true),
  ('درهم اماراتي', 'سوري', '3950', '4000', 5, true),
  ('دينار اردني', 'سوري', '20400', '20600', 6, true)
on conflict do nothing;
