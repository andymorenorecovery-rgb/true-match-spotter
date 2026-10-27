CREATE OR REPLACE FUNCTION public.delete_ad(_secret text, _id text, _user_id uuid)
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
begin
  if not exists (select 1 from public.app_secrets where name = 'ad_publish' and hash = encode(sha256(convert_to(coalesce(_secret, ''), 'UTF8')), 'hex')) then
    return false;
  end if;
  -- Takes the ad off the site only; the owner's paid record stays so they can repost within their paid time.
  delete from public.ads where id = _id;
  return true;
end $function$;