import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ageFrom, MIN_AGE } from "@/lib/age";
import { BUSINESS } from "@/lib/contact";

const KEY = "rtm-post-agreed";

const RULES: [string, string][] = [
  ["Adults only", `You must be ${MIN_AGE} or older to post or reply. Lying about your age gets your account removed with no refund and, where the law allows, reported to authorities.`],
  ["Hookups and dating only", "Ads are for dating and casual meetups between consenting adults. No escorts, no paid companionship and no offering or asking for money, gifts or anything of value in exchange for sex or time."],
  ["No nudity", "No nude or sexually explicit photos or videos. Photos must be of you and match your selfie video."],
  ["Be real", "No fake profiles, catfishing, scams, spam or using someone else's pictures."],
  ["Respect others", "No harassment, threats, hate or pressuring anyone. Stop contacting anyone who asks you to stop."],
  ["Trafficking and minors", "Any ad involving minors or trafficking is removed and reported to law enforcement and the National Center for Missing & Exploited Children."],
  ["Your safety", "Meet in public, tell a friend where you are going, and never send money. We are not responsible for what happens when members meet off the site."],
  ["Removal", "We may remove any ad or account that breaks these rules without refund. Paying for an ad does not guarantee views, contacts or matches."],
  ["Full terms", "Posting also means you agree to our Terms of Service and Privacy Policy."],
];

export function PostAgreement({ children }: { children: React.ReactNode }) {
  const [passed, setPassed] = useState<boolean | null>(null);
  const [step, setStep] = useState<"rules" | "dob">("rules");
  const [bottom, setBottom] = useState(false);
  const [agree, setAgree] = useState(false);
  const [dob, setDob] = useState({ y: "", m: "", d: "" });
  const [error, setError] = useState("");
  const box = useRef<HTMLDivElement>(null);

  // sessionStorage survives the phone reloading the page while picking photos.
  useEffect(() => setPassed(sessionStorage.getItem(KEY) === "1"), []);

  if (passed === null) return null;
  if (passed) return <>{children}</>;

  const onScroll = () => {
    const el = box.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setBottom(true);
  };

  const submit = () => {
    const age = ageFrom(Number(dob.y), Number(dob.m), Number(dob.d));
    if (age === null) return setError("Please enter a real date of birth.");
    if (age < MIN_AGE) return setError(`You must be ${MIN_AGE} or older to post an ad.`);
    sessionStorage.setItem(KEY, "1");
    setPassed(true);
  };

  const field = "w-full rounded-xl border bg-background px-3 py-3 text-center text-base outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      {step === "rules" ? (
        <>
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-primary">You must read and agree to the rules before you may post</p>
          <div ref={box} onScroll={onScroll} className="mt-4 h-[55vh] overflow-y-auto rounded-2xl border-2 bg-card p-5 text-sm leading-relaxed">
            <h2 className="text-lg font-bold">{BUSINESS.legalName} — Posting rules</h2>
            {RULES.map(([t, b], i) => (
              <div key={t} className="mt-4">
                <p className="font-semibold">{i + 1}. {t}</p>
                <p className="mt-1 text-muted-foreground">{b}</p>
              </div>
            ))}
            <p className="mt-4 text-muted-foreground">
              Read the full <Link to="/terms" className="text-primary underline">Terms</Link> and <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>.
            </p>
            <p className="mt-6 text-center italic text-muted-foreground">[nothing more follows]</p>
            <label className="mt-4 flex items-center justify-center gap-3">
              <input type="checkbox" className="h-5 w-5 accent-primary" checked={agree} disabled={!bottom} onChange={(e) => setAgree(e.target.checked)} />
              <span>Yes, I have read and agree to the rules</span>
            </label>
          </div>
          {!bottom && <p className="mt-2 text-center text-xs text-muted-foreground">Scroll to the bottom to continue</p>}
          <button type="button" disabled={!agree} onClick={() => setStep("dob")} className="mx-auto mt-4 block rounded-full bg-gradient-primary px-10 py-3 text-lg font-semibold text-primary-foreground disabled:opacity-40">
            OK, I agree
          </button>
        </>
      ) : (
        <div className="rounded-2xl border bg-card p-6 text-center">
          <h2 className="text-2xl font-bold">Confirm your age</h2>
          <p className="mt-2 text-muted-foreground">Enter your date of birth. You must be {MIN_AGE} or older to post.</p>
          <div className="mt-5 grid grid-cols-[1.4fr_1fr_1fr] gap-3">
            <input inputMode="numeric" maxLength={4} placeholder="YYYY" aria-label="Year" className={field} value={dob.y} onChange={(e) => setDob({ ...dob, y: e.target.value.replace(/\D/g, "") })} />
            <input inputMode="numeric" maxLength={2} placeholder="MM" aria-label="Month" className={field} value={dob.m} onChange={(e) => setDob({ ...dob, m: e.target.value.replace(/\D/g, "") })} />
            <input inputMode="numeric" maxLength={2} placeholder="DD" aria-label="Day" className={field} value={dob.d} onChange={(e) => setDob({ ...dob, d: e.target.value.replace(/\D/g, "") })} />
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <button type="button" onClick={submit} className="mt-5 w-full rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground">Submit</button>
        </div>
      )}
    </div>
  );
}
