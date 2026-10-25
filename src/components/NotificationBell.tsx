import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAccount, markNotificationsRead } from "@/utils/account.functions";
import { useAuth } from "@/hooks/useAuth";

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
  const { data } = useQuery({ queryKey: accountQueryKey, queryFn: () => getAccount(), enabled: !!user, refetchInterval: 5 * 60000 });
  if (user === undefined) return null;
  if (!user) return (
    <>
      {/* Phone: two compact controls so both fit on one row */}
      <Link to="/auth" className="whitespace-nowrap px-1 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground sm:hidden">Sign in</Link>
      <Link to="/auth" className="whitespace-nowrap rounded-full bg-gradient-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground sm:hidden">Sign up</Link>
      {/* Desktop: one pill */}
      <Link to="/auth" className="hidden whitespace-nowrap rounded-full border border-primary px-3 py-1.5 text-sm font-semibold text-primary hover:bg-secondary sm:inline-flex">Sign up / Sign in</Link>
    </>
  );
  const notes = data?.notifications ?? [];
  const unread = notes.filter((n) => !n.read_at).length;
  return (
    <Popover onOpenChange={(open) => { if (!open && unread) markNotificationsRead().then(() => qc.invalidateQueries({ queryKey: accountQueryKey })); }}>
      <PopoverTrigger aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-[70vh] w-80 overflow-y-auto">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold">Notifications</p>
          <Link to="/account" className="text-xs text-primary underline">My account</Link>
        </div>
        <NotificationList notes={notes} />
      </PopoverContent>
    </Popover>
  );
}
