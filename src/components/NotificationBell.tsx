import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const accountQueryKey = ["account"] as const;

export function NotificationList({ notes }: { notes: { id: string; message: string; read_at: string | null; created_at: string }[] }) {
  if (!notes.length) return <p className="text-sm text-muted-foreground">No reminders yet. We'll let you know when your boost or ad runs out.</p>;
  return (
    <ul className="space-y-2">
      {notes.map((n) => (
        <li key={n.id} className={`rounded-xl border p-3 text-sm ${n.read_at ? "" : "border-primary bg-secondary"}`}>
          <p>{n.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );
}

export function NotificationBell() {
  const user = useAuth();
  const qc = useQueryClient();

  if (user === undefined) return null;
  if (!user) return (
    <>
      {/* Phone: two compact controls so both fit on one row */}
      <Link to="/auth" className="whitespace-nowrap px-1 py-1 text-xs font-medium text-muted-foreground hover:text-foreground sm:hidden">Sign in</Link>
      <Link to="/auth" className="whitespace-nowrap rounded-full bg-gradient-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground sm:hidden">Sign up</Link>
      {/* Desktop: one pill */}
      <Link to="/auth" className="hidden whitespace-nowrap rounded-full border border-primary px-3 py-1.5 text-sm font-semibold text-primary hover:bg-secondary sm:inline-flex">Sign up / Sign in</Link>
    </>
  );
  return (
    <>
      <Link to="/account" className="whitespace-nowrap rounded-full bg-gradient-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground sm:px-3 sm:py-1.5 sm:text-sm">
        My ads
      </Link>
      <button
        onClick={async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); window.location.replace("/"); }}
        className="whitespace-nowrap px-1 py-1 text-xs font-medium text-muted-foreground hover:text-foreground sm:text-sm"
      >
        Sign out
      </button>
    </>
  );
}
