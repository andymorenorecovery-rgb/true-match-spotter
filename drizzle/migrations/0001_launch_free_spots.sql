CREATE TABLE public.launch_claims (
  user_id uuid PRIMARY KEY,
  ad_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.launch_claims TO service_role;
ALTER TABLE public.launch_claims ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.claim_launch_spot(_user_id uuid, _ad_id text, _limit integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  LOCK TABLE public.launch_claims IN EXCLUSIVE MODE;
  IF EXISTS (SELECT 1 FROM public.launch_claims WHERE user_id = _user_id) THEN RETURN false; END IF;
  IF (SELECT count(*) FROM public.launch_claims) >= _limit THEN RETURN false; END IF;
  INSERT INTO public.launch_claims (user_id, ad_id) VALUES (_user_id, _ad_id);
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_launch_spot(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_launch_spot(uuid, text, integer) TO service_role;