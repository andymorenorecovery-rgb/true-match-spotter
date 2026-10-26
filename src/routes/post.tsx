import { FitImage } from "@/components/FitImage";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAccount, redeemFreeWeek } from "@/utils/account.functions";
import { accountQueryKey } from "@/components/NotificationBell";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
const DRAFT_KEY = "rtm-post-draft";
function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
import { ImagePlus, MapPin, Phone, X } from "lucide-react";
import { CATEGORIES, DETAIL_FIELDS, formatLocation, type Category, type Details, type Listing } from "@/lib/listings";
import { loadLocalAds, publishPendingAd, resizeImage, savePendingAd, updateLocalAd } from "@/lib/local-ads";
import { syncAd } from "@/lib/ad-sync";
import { getAdVideo, loadDraftMedia, saveAdVideo, saveDraftMedia, VIDEO_SECONDS } from "@/lib/ad-videos";
import { VideoRecorder } from "@/components/VideoRecorder";
import { PRICING, PRICE_IDS, formatPrice } from "@/lib/pricing";
import { US_CITIES, US_STATES } from "@/data/us-locations";
import { CheckoutDialog, type CheckoutRequest } from "@/components/CheckoutDialog";

export const Route = createFileRoute("/post")({
  validateSearch: (s: Record<string, unknown>): { edit?: string } => {
    const edit = typeof s["edit"] === "string" && s["edit"].startsWith("local-") ? s["edit"] : undefined;
    return edit ? { edit } : {};
  },
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
  const [video, setVideo] = useState<Blob | null>(null);
  const [chosenPlan, setPlan] = useState<"dayAd" | "weekAd" | "monthAd">("dayAd");
  const [boost, setBoost] = useState(false);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState<CheckoutRequest | null>(null);
  const user = useAuth();
  const navigate = useNavigate();
  const { data: account } = useQuery({ queryKey: accountQueryKey, queryFn: () => getAccount(), enabled: !!user });
  const launchFree = !!account?.launchFree;
  const credits = (account?.profile?.free_week_credits ?? 0) + (launchFree ? 1 : 0);
  const [useFree, setUseFree] = useState(true);
  const free = useFree && credits > 0;
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const loc = formatLocation(f);

  // Autosave the draft: phones often reload the page after the camera or photo
  // picker closes, which used to wipe everything the person typed.
  // Editing an existing ad skips the draft and loads that ad instead.
  const editId = Route.useSearch().edit;
  const [restored, setRestored] = useState(false);
  const [missingEdit, setMissingEdit] = useState(false);
  useEffect(() => {
    if (editId) {
      const ad = loadLocalAds().find((a) => a.id === editId);
      if (ad) {
        setF({ title: ad.title, name: ad.name, age: String(ad.age), category: ad.category, city: ad.city, state: ad.state, area: ad.area, body: ad.body, phone: ad.phone ?? "", showPhone: !!ad.phone });
        setDetails(ad.details ?? {});
        setPhotos([ad.img, ...(ad.photos ?? [])]);
        getAdVideo(ad.id).then((v) => { if (v) setVideo(v); }).finally(() => setRestored(true));
      } else {
        setMissingEdit(true);
        setRestored(true);
      }
      return;
    }
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
      if (d) { setF((p) => ({ ...p, ...d.f })); setDetails(d.details ?? {}); if (d.plan) setPlan(d.plan); setBoost(!!d.boost); }
    } catch { /* ignore broken draft */ }
    loadDraftMedia().then((m) => { if (m.photos.length) setPhotos(m.photos); if (m.video) setVideo(m.video); }).finally(() => setRestored(true));
  }, []);
  useEffect(() => {
    if (!restored || editId) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ f, details, plan: chosenPlan, boost })); } catch { /* storage full */ }
  }, [restored, f, details, chosenPlan, boost, editId]);
  useEffect(() => { if (restored && !editId) saveDraftMedia(photos, video); }, [restored, photos, video, editId]);
  const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* */ } saveDraftMedia([], null); };

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    const urls = await Promise.all([...files].slice(0, 6 - photos.length).map((file) => resizeImage(file)));
    setPhotos((p) => [...p, ...urls].slice(0, 6));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const age = Number(f.age);
    if (!f.title.trim() || !f.name.trim()) return setError("Please add a headline and your first name.");
    if (!age || age < 18 || age > 99) return setError("You must be 18 or older to post.");
    if (!f.state || !f.city.trim()) return setError("Please pick your state and city.");
    if (!f.body.trim()) return setError("Please write something in your ad.");
    if (!photos.length) return setError("Please add at least one photo.");
    if (!video) return setError(`Please record your ${VIDEO_SECONDS}-second video selfie so people know you're real.`);
    if (editId) {
      const base = loadLocalAds().find((a) => a.id === editId);
      if (!base) return setError("We couldn't find that ad on this device.");
      const updated: Listing = { ...base, title: f.title.trim(), name: f.name.trim(), age, city: f.city.trim(), state: f.state, area: f.area.trim(), category: f.category, body: f.body.trim(), img: photos[0]!, photos: photos.slice(1), details };
      if (f.showPhone && f.phone) updated.phone = f.phone;
      else delete updated.phone;
      try {
        await saveAdVideo(editId, video);
      } catch {
        return setError("We couldn't save your video. Please try recording again.");
      }
      // New video gets uploaded again; photos re-upload only if they changed.
      updated.synced = false;
      if (updated.remote) { const { video: _old, ...keep } = updated.remote; updated.remote = keep; }
      try {
        updateLocalAd(updated);
      } catch {
        return setError("Those photos are too big to save. Try fewer photos.");
      }
      await syncAd(editId);
      return navigate({ to: "/listings/$id", params: { id: editId } });
    }
    if (free && !user) return setError("Please sign in to use a free ad.");
    const now = Date.now();
    const plan = free ? "weekAd" : chosenPlan;
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
      plan: plan === "dayAd" ? "day" : plan === "monthAd" ? "month" : "week",
      ...(plan !== "dayAd" || boost
        ? { featuredUntil: new Date(now + (plan !== "dayAd" ? PRICING[plan].includedBoostHours : PRICING.boost.durationHours) * 3600000).toISOString() }
        : {}),
    };
    try {
      await saveAdVideo(ad.id, video);
    } catch {
      return setError("We couldn't save your video. Please try recording again.");
    }
    try {
      savePendingAd(ad);
    } catch {
      return setError("Those photos are too big to save. Try fewer photos.");
    }
    if (free) {
      const r = await redeemFreeWeek({ data: { adId: ad.id, title: ad.title } }).catch(() => ({ ok: false }));
      if (!r.ok) return setError("We couldn't use your free week. Please try again.");
      publishPendingAd(ad.id);
      clearDraft();
      await syncAd(ad.id);
      return navigate({ to: "/account" });
    }
    setCheckout({
      adId: ad.id,
      kind: "post",
      priceIds: [PRICE_IDS[plan], ...(plan === "dayAd" && boost ? [PRICE_IDS.boost] : [])],
    });
  };
  const plan = free ? "weekAd" : chosenPlan;
  const total = PRICING[plan].priceCents + (plan === "dayAd" && boost ? PRICING.boost.priceCents : 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">{editId ? "Edit my ad" : "Post an ad"}</h1>
      {!editId && <p className="mt-2 text-muted-foreground">{formatPrice(PRICING.dayAd.priceCents)} for 24 hours, {formatPrice(PRICING.weekAd.priceCents)} for a week or {formatPrice(PRICING.monthAd.priceCents)} for a month. Fill in as much or as little as you like.</p>}

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
                  <FitImage src={p} alt="" />
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

          <Section title="Video selfie (required)">
            <p className="mb-4 text-sm text-muted-foreground">Record a quick {VIDEO_SECONDS}-second video of yourself with your camera so people know you're real. It shows on your profile with your photos.</p>
            <VideoRecorder value={video} onChange={setVideo} />
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
            <Field label="Phone number"><input className={input} type="tel" value={f.phone} inputMode="tel" autoComplete="tel" maxLength={14} onChange={(e) => set("phone", formatPhone(e.target.value))} placeholder="(213) 555-0123" /></Field>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.showPhone} onChange={(e) => set("showPhone", e.target.checked)} className="h-4 w-4 accent-primary" />
              Show my number on my ad
            </label>
          </Section>

          {!editId && credits > 0 && (
            <label className="flex items-center gap-3 rounded-2xl border border-primary bg-card p-4 text-sm">
              <input type="checkbox" checked={useFree} onChange={(e) => setUseFree(e.target.checked)} className="h-4 w-4 accent-primary" />
              {launchFree && credits === 1
                ? <>Launch special: post a free 1-week ad — only {account?.launchSpotsLeft} of the first 10 free spots left</>
                : <>Use one of my free 1-week ads ({credits} left) — no payment needed</>}
            </label>
          )}

          {!free && !editId && <Section title="How long?">
            <div className="flex flex-wrap gap-2">
              {(["dayAd", "weekAd", "monthAd"] as const).map((p) => (
                <button type="button" key={p} onClick={() => setPlan(p)} className={`rounded-full px-4 py-2 text-sm ${plan === p ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  {p === "dayAd" ? "24 hours" : p === "weekAd" ? "1 week" : "1 month"} — {formatPrice(PRICING[p].priceCents)}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {plan === "dayAd"
                ? "24-hour ads get a purple frame."
                : `${plan === "monthAd" ? "Month" : "Week"} ads get the green glow and a spot at the top for the first ${PRICING[plan].includedBoostHours} hours.`}
            </p>
            {plan === "dayAd" && (
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={boost} onChange={(e) => setBoost(e.target.checked)} className="h-4 w-4 accent-primary" />
                Also boost to the top with a green glow (+{formatPrice(PRICING.boost.priceCents)} for {PRICING.boost.durationHours} hours)
              </label>
            )}
          </Section>}

          {editId && missingEdit && <p className="text-sm text-destructive">We couldn't find that ad on this device. Ads are saved on the phone or browser they were posted from.</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" className="w-full rounded-full bg-gradient-primary py-4 font-semibold text-primary-foreground shadow-glow">
            {editId ? "Save my changes" : free ? "Post my free week ad" : `Pay ${formatPrice(total)} and post my ad`}
          </button>
          {user === null && !editId && (
            <p className="text-center text-xs text-muted-foreground">
              No account needed.{" "}
              <Link to="/auth" search={{ next: "/post" }} className="text-primary underline">Sign in</Link>{" "}
              to grab a free launch spot and get reminders when your ad runs out.
            </p>
          )}
          {!editId && <p className="text-center text-xs text-muted-foreground">Your ad goes live as soon as your payment goes through.</p>}
        </form>
        <CheckoutDialog request={checkout} onClose={() => setCheckout(null)} />

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
