import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { ImagePlus, MapPin, Phone, X } from "lucide-react";
import { CATEGORIES, DETAIL_FIELDS, formatLocation, type Category, type Details, type Listing } from "@/lib/listings";
import { resizeImage, saveLocalAd } from "@/lib/local-ads";
import { PRICING, formatPrice } from "@/lib/pricing";
import { US_CITIES, US_STATES } from "@/data/us-locations";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post an ad — Ready Too Mingle" },
      { name: "description", content: "Create your local personal ad on Ready Too Mingle." },
      { property: "og:title", content: "Post an ad — Ready Too Mingle" },
      { property: "og:description", content: "Create your local personal ad on Ready Too Mingle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PostAd,
});

const input = "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function PostAd() {
  const [f, setF] = useState({ title: "", name: "", age: "", category: "dating" as Category, city: "", state: "", area: "", body: "", phone: "", showPhone: false });
  const [details, setDetails] = useState<Details>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [plan, setPlan] = useState<"dayAd" | "weekAd">("dayAd");
  const [boost, setBoost] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const loc = formatLocation(f);

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    const urls = await Promise.all([...files].slice(0, 6 - photos.length).map((file) => resizeImage(file)));
    setPhotos((p) => [...p, ...urls].slice(0, 6));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const age = Number(f.age);
    if (!f.title.trim() || !f.name.trim()) return setError("Please add a headline and your first name.");
    if (!age || age < 18 || age > 99) return setError("You must be 18 or older to post.");
    if (!f.state || !f.city.trim()) return setError("Please pick your state and city.");
    if (!f.body.trim()) return setError("Please write something in your ad.");
    if (!photos.length) return setError("Please add at least one photo.");
    if (!agreed) return setError("Please agree to the rules before posting.");
    const now = Date.now();
    const ad: Listing = {
      id: `local-${now}`,
      title: f.title.trim(), name: f.name.trim(), age,
      city: f.city.trim(), state: f.state, area: f.area.trim(),
      category: f.category, body: f.body.trim(),
      img: photos[0]!, photos: photos.slice(1), details,
      ...(f.showPhone && f.phone ? { phone: f.phone } : {}),
      status: "published",
      postedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + PRICING[plan].durationHours * 3600000).toISOString(),
      plan: plan === "dayAd" ? "day" : "week",
      ...(plan === "weekAd" || boost
        ? { featuredUntil: new Date(now + (plan === "weekAd" ? PRICING.weekAd.includedBoostHours : PRICING.boost.durationHours) * 3600000).toISOString() }
        : {}),
    };
    try {
      saveLocalAd(ad);
    } catch {
      return setError("Those photos are too big to save in test mode. Try fewer photos.");
    }
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">Post an ad</h1>
      <p className="mt-2 text-muted-foreground">{formatPrice(PRICING.dayAd.priceCents)} for 24 hours or {formatPrice(PRICING.weekAd.priceCents)} for a week. Fill in as much or as little as you like.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={submit} className="space-y-8">
          <Section title="About you">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Headline" wide><input className={input} maxLength={80} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Coffee lover looking for a hiking buddy" /></Field>
              <Field label="First name"><input className={input} maxLength={30} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Age"><input className={input} type="number" min={18} max={99} value={f.age} onChange={(e) => set("age", e.target.value)} /></Field>
              <Field label="Category" wide>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button type="button" key={c.id} onClick={() => set("category", c.id)} className={`rounded-full px-4 py-2 text-sm ${f.category === c.id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{c.label}</button>
                  ))}
                </div>
              </Field>
            </div>
          </Section>

          <Section title="Photos">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-lg">
                  <img src={p} alt="" className="h-full w-full object-cover" />
                  <button type="button" aria-label="Remove photo" onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-overlay/70 p-1"><X className="h-3 w-3" /></button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground">
                  <ImagePlus className="h-5 w-5" /> Add
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
                </label>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Up to 6 photos. The first one is your main photo.</p>
          </Section>

          <Section title="Your details">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {DETAIL_FIELDS.filter((d) => !d.multi).map((d) => (
                <Field key={d.key} label={d.label}>
                  {d.options ? (
                    <select className={input} value={details[d.key] ?? ""} onChange={(e) => setDetails((p) => ({ ...p, [d.key]: e.target.value || undefined }))}>
                      <option value="">Prefer not to say</option>
                      {d.options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className={input} maxLength={60} value={details[d.key] ?? ""} onChange={(e) => setDetails((p) => ({ ...p, [d.key]: e.target.value || undefined }))} />
                  )}
                </Field>
              ))}
            </div>
            {DETAIL_FIELDS.filter((d) => d.multi).map((d) => {
              const picked = details[d.key]?.split(", ").filter(Boolean) ?? [];
              const toggle = (o: string) => {
                const next = picked.includes(o) ? picked.filter((x) => x !== o) : [...picked, o];
                setDetails((p) => ({ ...p, [d.key]: next.length ? next.join(", ") : undefined }));
              };
              return (
                <div key={d.key} className="mt-4">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{d.label} (tap all that apply)</span>
                  <div className="flex flex-wrap gap-2">
                    {d.options.map((o) => (
                      <button type="button" key={o} onClick={() => toggle(o)} className={`rounded-full px-4 py-2 text-sm ${picked.includes(o) ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{o}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </Section>

          <Section title="Location">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="State">
                <select className={input} value={f.state} onChange={(e) => { set("state", e.target.value); set("city", ""); }}>
                  <option value="">Select a state</option>
                  {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="City">
                <input
                  className={input}
                  list="us-cities"
                  value={f.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder={f.state ? "Type or choose your city" : "Pick a state first"}
                  disabled={!f.state}
                />
                {f.state && (
                  <datalist id="us-cities">
                    {US_CITIES[f.state]?.map((c) => <option key={c} value={c} />)}
                  </datalist>
                )}
              </Field>
              <Field label="Area / neighborhood"><input className={input} value={f.area} onChange={(e) => set("area", e.target.value)} placeholder="Downtown" /></Field>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Every US state and city is supported — small towns too; just type the name. Never enter your street address.</p>
          </Section>

          <Section title="Your ad">
            <textarea className={`${input} min-h-36`} maxLength={2000} value={f.body} onChange={(e) => set("body", e.target.value)} placeholder="Tell people about yourself and who you'd like to meet." />
            <p className="mt-1 text-right text-xs text-muted-foreground">{f.body.length}/2000</p>
          </Section>

          <Section title="Contact">
            <Field label="Phone number"><input className={input} type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(213) 555-0123" /></Field>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.showPhone} onChange={(e) => set("showPhone", e.target.checked)} className="h-4 w-4 accent-primary" />
              Show my number on my ad
            </label>
          </Section>

          <Section title="How long?">
            <div className="flex flex-wrap gap-2">
              {(["dayAd", "weekAd"] as const).map((p) => (
                <button type="button" key={p} onClick={() => setPlan(p)} className={`rounded-full px-4 py-2 text-sm ${plan === p ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  {p === "dayAd" ? "24 hours" : "1 week"} — {formatPrice(PRICING[p].priceCents)}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {plan === "dayAd"
                ? "24-hour ads get a purple frame."
                : `Week ads get the green glow and a spot at the top for the first ${PRICING.weekAd.includedBoostHours} hours.`}
            </p>
            {plan === "dayAd" && (
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={boost} onChange={(e) => setBoost(e.target.checked)} className="h-4 w-4 accent-primary" />
                Also boost to the top with a green glow (+{formatPrice(PRICING.boost.priceCents)} for {PRICING.boost.durationHours} hours)
              </label>
            )}
          </Section>

          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <p className="font-semibold">This is a dating site — not an escort or sex site.</p>
            <p className="mt-1 text-muted-foreground">No naked or sexual photos. No selling sex or paid "companionship". Reported ads that break the rules are removed and the poster is kicked off the site.</p>
            <label className="mt-3 flex items-start gap-2">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span>I'm 18 or older, these are my own photos, and I agree to the <Link to="/terms" className="text-primary underline">rules</Link>.</span>
            </label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" className="w-full rounded-full bg-gradient-primary py-4 font-semibold text-primary-foreground shadow-glow">
            Post my ad (test mode — free)
          </button>
          <p className="text-center text-xs text-muted-foreground">Test mode: your ad only shows on this device. No payment is taken.</p>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Preview</p>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-primary">{CATEGORIES.find((c) => c.id === f.category)?.label}</p>
            <h3 className="mt-1 text-xl font-semibold">{f.title || "Your headline"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.name || "Name"}{f.age ? `, ${f.age}` : ""}</p>
            {loc && <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{loc}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {DETAIL_FIELDS.filter((d) => details[d.key]).map((d) => (
                <span key={d.key} className="rounded-full bg-secondary px-3 py-1 text-xs"><span className="text-muted-foreground">{d.label}:</span> {details[d.key]}</span>
              ))}
            </div>
            {f.body && <p className="mt-4 line-clamp-5 text-sm">{f.body}</p>}
            {f.showPhone && f.phone && <p className="mt-4 flex items-center gap-2 text-sm text-primary"><Phone className="h-4 w-4" />{f.phone}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border bg-card p-6">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2 lg:col-span-full" : ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
