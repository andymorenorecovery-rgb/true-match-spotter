import { publicOrigin } from "@/lib/contact";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { next?: string | undefined } => ({
    next: typeof s["next"] === "string" && s["next"].startsWith("/") && !s["next"].startsWith("//") ? s["next"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Ready Too Mingle" },
      { name: "description", content: "Sign in or create your Ready Too Mingle account to post ads, earn free weeks and get reminders." },
      { property: "og:title", content: "Sign in — Ready Too Mingle" },
      { property: "og:description", content: "Sign in or create your Ready Too Mingle account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const input = "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const user = useAuth();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // Email confirmation links land here. If the link was already used or expired
  // (e.g. tapped twice, or opened in a different app), explain it instead of failing silently.
  useEffect(() => {
    const h = new URLSearchParams(window.location.hash.slice(1));
    const q = new URLSearchParams(window.location.search);
    const err = h.get("error_code") ?? q.get("error_code") ?? h.get("error") ?? q.get("error");
    if (err) {
      setMode("in");
      setMsg("That email link was already used or has expired — your email is most likely already confirmed. Sign in below with your email and password, or tap \"Forgot password?\".");
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (user) navigate({ to: next ?? "/account" });
  }, [user, next, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: publicOrigin() + "/auth" } });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Check your email and tap the link to confirm your account.");
    } else if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (/not confirmed/i.test(error.message)) setMsg("Please confirm your email first — tap the link we emailed you.");
        else if (/invalid login/i.test(error.message)) setMsg("That email and password don't match. Tap \"Forgot password?\" to reset it.");
        else setMsg(error.message);
      }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: publicOrigin() + "/reset-password" });
      setMsg(error ? error.message : "If that email has an account, we sent a link to reset your password. Check your inbox and spam.");
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setMsg("Google sign-in didn't work. Please try again.");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-4xl font-bold">{mode === "up" ? "Create your account" : mode === "in" ? "Welcome back" : "Reset your password"}</h1>
      <p className="mt-2 text-muted-foreground">Post ads, earn a free week for every friend you bring, and get reminders when your ad or boost runs out.</p>
      <button onClick={google} className="mt-8 w-full rounded-full border bg-card py-3 font-semibold">Continue with Google</button>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={submit} className="space-y-3">
        <input className={input} type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {mode !== "forgot" && <input className={input} type="password" required minLength={6} autoComplete={mode === "up" ? "new-password" : "current-password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />}
        {mode === "in" && (
          <button type="button" onClick={() => { setMode("forgot"); setMsg(""); }} className="block w-full text-right text-sm text-primary underline">Forgot password?</button>
        )}
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button disabled={busy} className="w-full rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
          {mode === "up" ? "Create account" : mode === "in" ? "Sign in" : "Email me a reset link"}
        </button>
      </form>
      <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} className="mt-6 w-full text-center text-sm text-muted-foreground underline">
        {mode === "up" ? "Already have an account? Sign in" : mode === "in" ? "New here? Create an account" : "Back to sign in"}
      </button>
    </div>
  );
}
