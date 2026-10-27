CREATE TABLE public.guest_ads (ad_id text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.guest_ads TO service_role;
ALTER TABLE public.guest_ads ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.claim_guest_ad(_secret text, _ad_id text, _limit int)
RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t timestamptz;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.app_secrets WHERE name = 'ad_publish' AND hash = encode(sha256(convert_to(coalesce(_secret, ''), 'UTF8')), 'hex')) THEN RETURN NULL; END IF;
  IF _ad_id !~ '^[a-zA-Z0-9_-]{1,60}$' THEN RETURN NULL; END IF;
  SELECT created_at INTO t FROM public.guest_ads WHERE ad_id = _ad_id;
  IF t IS NOT NULL THEN RETURN t; END IF;
  LOCK TABLE public.guest_ads IN EXCLUSIVE MODE;
  IF (SELECT count(*) FROM public.guest_ads) >= LEAST(_limit, 10) THEN RETURN NULL; END IF;
  INSERT INTO public.guest_ads (ad_id) VALUES (_ad_id) RETURNING created_at INTO t;
  RETURN t;
END $$;
REVOKE ALL ON FUNCTION public.claim_guest_ad(text, text, int) FROM public;
GRANT EXECUTE ON FUNCTION public.claim_guest_ad(text, text, int) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.guest_spots_left(_limit int)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(LEAST(_limit, 10) - (SELECT count(*)::int FROM public.guest_ads), 0)
$$;
GRANT EXECUTE ON FUNCTION public.guest_spots_left(int) TO anon, authenticated;