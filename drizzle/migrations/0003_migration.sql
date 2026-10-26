create table public.ads (
  id text primary key check (id ~ '^[a-zA-Z0-9_-]{1,60}$'),
  data jsonb not null,
  posted_at timestamptz not null,
  expires_at timestamptz not null,
  boost_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.ads enable row level security;
create policy "Anyone can read live ads" on public.ads for select to anon, authenticated using (expires_at > now());
grant select on public.ads to anon, authenticated;
create index ads_expires_idx on public.ads (expires_at);

create table public.app_secrets (name text primary key, hash text not null);
alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

-- Only the site's server knows the publish secret; it calls this after checking payment or account ownership.
create or replace function public.publish_ad(_secret text, _id text, _data jsonb, _posted_at timestamptz, _expires_at timestamptz, _boost_until timestamptz)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.app_secrets where name = 'ad_publish' and hash = encode(sha256(convert_to(coalesce(_secret, ''), 'UTF8')), 'hex')) then
    return false;
  end if;
  if _id !~ '^[a-zA-Z0-9_-]{1,60}$' or octet_length(_data::text) > 60000 then return false; end if;
  insert into public.ads (id, data, posted_at, expires_at, boost_until, updated_at)
  values (_id, _data, _posted_at, _expires_at, _boost_until, now())
  on conflict (id) do update set data = excluded.data, posted_at = excluded.posted_at,
    expires_at = excluded.expires_at, boost_until = excluded.boost_until, updated_at = now();
  return true;
end $$;
revoke all on function public.publish_ad(text, text, jsonb, timestamptz, timestamptz, timestamptz) from public;
grant execute on function public.publish_ad(text, text, jsonb, timestamptz, timestamptz, timestamptz) to anon, authenticated;

create policy "Anyone can upload ad media" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'ad-media' and (storage.foldername(name))[1] = 'ads');
create policy "Anyone can view ad media" on storage.objects for select to anon, authenticated
  using (bucket_id = 'ad-media');