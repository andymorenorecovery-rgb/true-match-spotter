import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Current signed-in user (null when signed out, undefined while loading). */
export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return user;
}

const REF_KEY = "rtm-ref";
export const saveInviteCode = (c: string) => localStorage.setItem(REF_KEY, c);
export const takeInviteCode = () => {
  const c = localStorage.getItem(REF_KEY);
  localStorage.removeItem(REF_KEY);
  return c;
};
