INSERT INTO public.user_ads (ad_id, user_id, title, plan, expires_at, boost_until)
SELECT 'local-1792986253726', '5c0cd540-7ab6-4307-8e9e-bc65c5ab9a5b', '', 'week', now() + interval '7 days', now() + interval '1 day'
WHERE NOT EXISTS (SELECT 1 FROM public.user_ads WHERE ad_id = 'local-1792986253726');