CREATE OR REPLACE FUNCTION public.launch_status(_limit integer)
RETURNS TABLE(spots_left integer, already_claimed boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(0, _limit - (SELECT count(*)::int FROM public.launch_claims)),
         EXISTS (SELECT 1 FROM public.launch_claims WHERE user_id = auth.uid());
$$;
REVOKE EXECUTE ON FUNCTION public.launch_status(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.launch_status(integer) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.redeem_free_week(_ad_id text, _title text, _launch_limit integer, _expires_at timestamptz, _boost_until timestamptz)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); spent int;
BEGIN
  IF uid IS NULL OR _ad_id !~ '^[a-zA-Z0-9_-]{1,60}$' THEN RETURN false; END IF;
  IF _expires_at > now() + interval '8 days' OR _boost_until > now() + interval '2 days' THEN RETURN false; END IF;
  UPDATE public.profiles SET free_week_credits = free_week_credits - 1 WHERE id = uid AND free_week_credits > 0;
  GET DIAGNOSTICS spent = ROW_COUNT;
  IF spent = 0 THEN
    LOCK TABLE public.launch_claims IN EXCLUSIVE MODE;
    IF EXISTS (SELECT 1 FROM public.launch_claims WHERE user_id = uid) THEN RETURN false; END IF;
    IF (SELECT count(*) FROM public.launch_claims) >= LEAST(_launch_limit, 10) THEN RETURN false; END IF;
    INSERT INTO public.launch_claims (user_id, ad_id) VALUES (uid, _ad_id);
  END IF;
  INSERT INTO public.user_ads (ad_id, user_id, title, plan, expires_at, boost_until)
  VALUES (_ad_id, uid, left(coalesce(_title, ''), 120), 'week', _expires_at, _boost_until);
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.redeem_free_week(text, text, integer, timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_free_week(text, text, integer, timestamptz, timestamptz) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.claim_referral(_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); inviter uuid;
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_ads WHERE user_id = uid) THEN RETURN false; END IF;
  SELECT id INTO inviter FROM public.profiles WHERE referral_code = lower(_code) AND id <> uid;
  IF inviter IS NULL THEN RETURN false; END IF;
  UPDATE public.profiles SET referred_by = inviter WHERE id = uid AND referred_by IS NULL;
  RETURN FOUND;
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_referral(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_referral(text) TO authenticated, service_role;