import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Ready Too Mingle" },
      { name: "description", content: "Choose a new password for your Ready Too Mingle account." },
      { property: "og:title", content: "Set a new password — Ready Too Mingle" },
      { property: "og:description", content: "Choose a new password for your Ready Too Mingle account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const input = "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: d }) => { if (d.session) setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setMsg("The two passwords don't match.");
    setBusy(true);
    setMsg("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setMsg(error.message);
    setMsg("Password changed. Taking you to your account…");
    setTimeout(() => navigate({ to: "/account" }), 1200);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-4xl font-bold">Set a new password</h1>
      {!ready ? (
        <p className="mt-4 text-muted-foreground">Open this page from the reset link in your email. If the link expired, go to Sign in and tap "Forgot password?" again.</p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input className={input} type="password" required minLength={6} autoComplete="new-password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className={input} type="password" required minLength={6} autoComplete="new-password" placeholder="Type it again" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
          <button disabled={busy} className="w-full rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60">Save new password</button>
        </form>
      )}
    </div>
  );
}
