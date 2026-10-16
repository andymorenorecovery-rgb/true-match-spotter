import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { MapPin, Phone } from "lucide-react";
import { CATEGORIES, DETAIL_FIELDS, formatLocation, type Category, type Details } from "@/lib/listings";
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
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const loc = formatLocation(f);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">Post an ad</h1>
      <p className="mt-2 text-muted-foreground">{formatPrice(PRICING.standardAd.priceCents)} for {PRICING.standardAd.durationDays} days. Fill in as much or as little as you like.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
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

          <Section title="Your details">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DETAIL_FIELDS.map((d) => (
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

          <button disabled className="w-full rounded-full bg-secondary py-4 font-semibold text-muted-foreground">
            Publishing opens once accounts and payments are set up
          </button>
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
