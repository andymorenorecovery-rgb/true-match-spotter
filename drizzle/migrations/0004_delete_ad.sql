CREATE OR REPLACE FUNCTION public.delete_ad(_secret text, _id text, _user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
begin
  if not exists (select 1 from public.app_secrets where name = 'ad_publish' and hash = encode(sha256(convert_to(coalesce(_secret, ''), 'UTF8')), 'hex')) then
    return false;
  end if;
  delete from public.ads where id = _id;
  if _user_id is not null then delete from public.user_ads where ad_id = _id and user_id = _user_id; end if;
  return true;
end $$;
REVOKE ALL ON FUNCTION public.delete_ad(text, text, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.delete_ad(text, text, uuid) TO anon, authenticated, service_role;