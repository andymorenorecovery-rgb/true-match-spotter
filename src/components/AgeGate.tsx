import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { BUSINESS_NAME } from "@/lib/contact";


const KEY = "rtm-age-ok";

type GateState = "checking" | "open" | "denied" | "ok";

/**
 * Full-screen age check shown once per browser before the site is readable.
 * Nothing behind it is interactive while it is up.
 */
export function AgeGate() {
  const navigate = useNavigate();
  const [state, setState] = useState<GateState>("checking");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      setState(localStorage.getItem(KEY) === "1" ? "ok" : "open");
    } catch {
      setState("open");
    }
  }, []);

  // Keep the page behind the gate from scrolling.
  useEffect(() => {
    const locked = state !== "ok";
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [state]);

  if (state === "ok") return null;

  function confirmAge() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* storage unavailable — the gate will simply ask again next visit */
    }
    setState("ok");
    // Always land on the front page after confirming.
    navigate({ to: "/" });
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-overlay/95 px-4 py-8 backdrop-blur-sm"
      style={{
        backgroundImage:
          "radial-gradient(600px circle at 50% 0%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 70%)",
      }}
    >
      {state === "denied" ? (
        <div
          role="alert"
          className="w-full max-w-md rounded-3xl border bg-card p-6 text-center shadow-glow sm:p-8"
        >
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-3xl">Come back when you're 18</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ready Too Mingle is only for adults. Close this page and come back once you're of age.
          </p>
          <a
            href="https://www.google.com"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-input bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Leave the site
          </a>
        </div>
      ) : (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
          className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-glow sm:p-8"
        >
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <h2 id="age-gate-title" className="mt-5 text-center text-3xl leading-tight">
            Adults only
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
            {BUSINESS_NAME} runs a dating and casual-encounter site for people{" "}
            <span className="font-semibold text-foreground">18 years and older</span>. Please
            confirm below to continue.

          </p>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border bg-background/60 p-4 transition-colors hover:border-primary/40">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
            <span className="text-sm leading-relaxed">
              I confirm I am <span className="font-semibold text-foreground">18 or older</span>, and
              I agree to the{" "}
              <Link to="/terms" className="text-primary underline">
                rules and terms
              </Link>
              .
            </span>
          </label>

          <p className="mt-4 text-xs leading-relaxed text-foreground/70">
            Lying about your age breaks our terms: your ads come down, your account is removed with
            no refund, and where the law allows we will report it and press charges.
          </p>

          <button
            type="button"
            disabled={!checked}
            onClick={confirmAge}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enter site
          </button>

          <button
            type="button"
            onClick={() => setState("denied")}
            className="mt-3 w-full text-center text-xs text-muted-foreground underline transition-colors hover:text-foreground"
          >
            I'm under 18
          </button>
        </div>
      )}
    </div>
  );
}
