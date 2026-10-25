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
  const [mode, setMode] = useState<"in" | "up">("up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: next ?? "/account" });
  }, [user, next, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: publicOrigin() + "/account" } });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Check your email and tap the link to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setMsg("Google sign-in didn't work. Please try again.");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-4xl font-bold">{mode === "up" ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-2 text-muted-foreground">Post ads, earn a free week for every friend you bring, and get reminders when your ad or boost runs out.</p>
      <button onClick={google} className="mt-8 w-full rounded-full border bg-card py-3 font-semibold">Continue with Google</button>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={submit} className="space-y-3">
        <input className={input} type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input} type="password" required minLength={6} autoComplete={mode === "up" ? "new-password" : "current-password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button disabled={busy} className="w-full rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
          {mode === "up" ? "Create account" : "Sign in"}
        </button>
      </form>
      <button onClick={() => { setMode(mode === "up" ? "in" : "up"); setMsg(""); }} className="mt-6 w-full text-center text-sm text-muted-foreground underline">
        {mode === "up" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </div>
  );
}
