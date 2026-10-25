import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { saveInviteCode, takeInviteCode } from "@/hooks/useAuth";
import { claimReferral } from "@/utils/account.functions";
import { isReferralCode } from "@/lib/rewards";

// Old confirmation links point at /account, whose sign-in check would drop the
// link's error before anyone sees it. Runs on load, before routing.
if (typeof window !== "undefined" && /error_code=|error=/.test(window.location.hash) && window.location.pathname !== "/auth") {
  window.location.replace("/auth" + window.location.hash);
}

/** Remembers ?ref= invite links and links the account to the inviter once signed in. */
export function ReferralWatcher() {
  const qc = useQueryClient();
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref")?.toLowerCase();
    if (ref && isReferralCode(ref)) saveInviteCode(ref);
    const claim = () => {
      const code = takeInviteCode();
      if (code) claimReferral({ data: { code } }).catch(() => {});
    };
    supabase.auth.getSession().then(({ data }) => data.session && claim());
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      if (event === "SIGNED_IN") claim();
      if (event === "SIGNED_OUT") qc.removeQueries();
      else qc.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [qc]);
  return null;
}
