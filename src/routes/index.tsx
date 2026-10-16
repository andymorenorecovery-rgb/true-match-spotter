import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Flame, Heart, MessageCircle, X, MapPin, Send, Star, ArrowLeft } from "lucide-react";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Adult Spotter — Swipe, match & chat" },
      { name: "description", content: "Discover people near you, match when it's mutual and start chatting." },
      { property: "og:title", content: "Adult Spotter — Swipe, match & chat" },
      { property: "og:description", content: "Discover people near you, match when it's mutual and start chatting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Profile = { id: number; name: string; age: number; km: number; bio: string; tags: string[]; img: string; likesYou: boolean };
type Msg = { from: "me" | "them"; text: string };

const PROFILES: Profile[] = [
  { id: 1, name: "Sofia", age: 28, km: 2, bio: "Rooftop sunsets, vinyl, and terrible puns. Looking for someone to split dessert with.", tags: ["Music", "Wine", "Travel"], img: p1, likesYou: true },
  { id: 2, name: "Daniel", age: 32, km: 4, bio: "Coffee snob, weekend cyclist, bookshop wanderer.", tags: ["Coffee", "Books", "Cycling"], img: p2, likesYou: false },
  { id: 3, name: "Hannah", age: 35, km: 7, bio: "If there's a trail, I'm on it. Dogs > people (mostly).", tags: ["Hiking", "Dogs", "Camping"], img: p3, likesYou: true },
  { id: 4, name: "Marcus", age: 29, km: 3, bio: "Street food hunter. Let's find the best dumplings in town.", tags: ["Food", "Nightlife", "Film"], img: p4, likesYou: true },
];

type Tab = "discover" | "matches";

function App() {
  const [tab, setTab] = useState<Tab>("discover");
  const [deck, setDeck] = useState(PROFILES);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [newMatch, setNewMatch] = useState<Profile | null>(null);
  const [chats, setChats] = useState<Record<number, Msg[]>>({});
  const [openChat, setOpenChat] = useState<Profile | null>(null);

  const decide = (liked: boolean) => {
    const top = deck[0];
    if (!top) return;
    setDeck((d) => d.slice(1));
    if (liked && top.likesYou) {
      setMatches((m) => [top, ...m]);
      setChats((c) => ({ ...c, [top.id]: [{ from: "them", text: `Hey! Nice to match 😊` }] }));
      setNewMatch(top);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Adult <span className="text-gradient italic">Spotter</span>
        </h1>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">18+</span>
      </header>

      {openChat ? (
        <Chat
          profile={openChat}
          msgs={chats[openChat.id] ?? []}
          onBack={() => setOpenChat(null)}
          onSend={(text) =>
            setChats((c) => ({ ...c, [openChat.id]: [...(c[openChat.id] ?? []), { from: "me", text }] }))
          }
        />
      ) : tab === "discover" ? (
        <Discover deck={deck} onDecide={decide} onReset={() => setDeck(PROFILES.filter((p) => !matches.includes(p)))} />
      ) : (
        <Matches matches={matches} chats={chats} onOpen={setOpenChat} />
      )}

      <nav className="fixed inset-x-0 bottom-0 border-t bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-md justify-around py-3">
          <NavBtn active={tab === "discover" && !openChat} onClick={() => { setOpenChat(null); setTab("discover"); }} icon={<Flame />} label="Discover" />
          <NavBtn active={tab === "matches" || !!openChat} onClick={() => { setOpenChat(null); setTab("matches"); }} icon={<MessageCircle />} label={`Matches${matches.length ? ` (${matches.length})` : ""}`} />
        </div>
      </nav>

      {newMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/85 p-6 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm text-center animate-in zoom-in-90">
            <p className="text-4xl font-bold italic text-gradient" style={{ fontFamily: "var(--font-display)" }}>It's a match!</p>
            <p className="mt-2 text-muted-foreground">You and {newMatch.name} liked each other.</p>
            <img src={newMatch.img} alt={newMatch.name} className="mx-auto mt-6 h-40 w-40 rounded-full object-cover ring-4 ring-primary shadow-glow" />
            <button onClick={() => { setOpenChat(newMatch); setNewMatch(null); }} className="mt-8 w-full rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow">
              Send a message
            </button>
            <button onClick={() => setNewMatch(null)} className="mt-3 w-full py-2 text-sm text-muted-foreground">Keep swiping</button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
      <span className="[&_svg]:h-6 [&_svg]:w-6">{icon}</span>
      {label}
    </button>
  );
}

function Discover({ deck, onDecide, onReset }: { deck: Profile[]; onDecide: (liked: boolean) => void; onReset: () => void }) {
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const top = deck[0];

  if (!top)
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Heart className="h-12 w-12 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold">That's everyone nearby</h2>
        <p className="mt-2 text-sm text-muted-foreground">Check back soon for new people.</p>
        <button onClick={onReset} className="mt-6 rounded-full bg-secondary px-5 py-2 text-sm font-medium">Start over</button>
      </div>
    );

  const release = () => {
    if (dx > 100) onDecide(true);
    else if (dx < -100) onDecide(false);
    setDx(0);
    start.current = null;
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative aspect-[3/4] w-full">
        {deck[1] && (
          <img src={deck[1].img} alt="" className="absolute inset-0 h-full w-full scale-95 rounded-3xl object-cover opacity-60" />
        )}
        <div
          key={top.id}
          className="absolute inset-0 touch-none select-none overflow-hidden rounded-3xl shadow-glow animate-in fade-in zoom-in-95"
          style={{ transform: `translateX(${dx}px) rotate(${dx / 18}deg)`, transition: start.current === null ? "transform .25s" : "none" }}
          onPointerDown={(e) => { start.current = e.clientX; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => start.current !== null && setDx(e.clientX - start.current)}
          onPointerUp={release}
          onPointerCancel={release}
        >
          <img src={top.img} alt={top.name} width={768} height={1024} draggable={false} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-card" />
          {dx > 40 && <span className="absolute left-5 top-6 -rotate-12 rounded-lg border-4 border-like px-3 py-1 text-2xl font-bold text-like">LIKE</span>}
          {dx < -40 && <span className="absolute right-5 top-6 rotate-12 rounded-lg border-4 border-destructive px-3 py-1 text-2xl font-bold text-destructive">NOPE</span>}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h2 className="text-3xl font-bold">{top.name} <span className="font-medium opacity-80">{top.age}</span></h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{top.km} km away</p>
            <p className="mt-3 text-sm leading-relaxed">{top.bio}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {top.tags.map((t) => <span key={t} className="rounded-full bg-secondary/80 px-3 py-1 text-xs backdrop-blur">{t}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <button aria-label="Pass" onClick={() => onDecide(false)} className="grid h-16 w-16 place-items-center rounded-full border bg-card text-destructive transition hover:scale-110"><X className="h-8 w-8" /></button>
        <button aria-label="Super like" onClick={() => onDecide(true)} className="grid h-12 w-12 place-items-center rounded-full border bg-card text-primary-glow transition hover:scale-110"><Star className="h-5 w-5" /></button>
        <button aria-label="Like" onClick={() => onDecide(true)} className="grid h-16 w-16 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition hover:scale-110"><Heart className="h-8 w-8 fill-current" /></button>
      </div>
    </div>
  );
}

function Matches({ matches, chats, onOpen }: { matches: Profile[]; chats: Record<number, Msg[]>; onOpen: (p: Profile) => void }) {
  if (!matches.length)
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <MessageCircle className="h-12 w-12 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold">No matches yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Start liking people in Discover.</p>
      </div>
    );
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Your matches</h2>
      <ul className="space-y-2">
        {matches.map((m) => {
          const last = chats[m.id]?.at(-1);
          return (
            <li key={m.id}>
              <button onClick={() => onOpen(m)} className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left transition hover:bg-accent">
                <img src={m.img} alt={m.name} className="h-14 w-14 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="font-semibold">{m.name}, {m.age}</p>
                  <p className="truncate text-sm text-muted-foreground">{last ? `${last.from === "me" ? "You: " : ""}${last.text}` : "Say hi!"}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Chat({ profile, msgs, onBack, onSend }: { profile: Profile; msgs: Msg[]; onBack: () => void; onSend: (t: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center gap-3">
        <button aria-label="Back" onClick={onBack} className="rounded-full p-2 hover:bg-secondary"><ArrowLeft className="h-5 w-5" /></button>
        <img src={profile.img} alt={profile.name} className="h-10 w-10 rounded-full object-cover" />
        <p className="font-semibold">{profile.name}</p>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {msgs.map((m, i) => (
          <p key={i} className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.from === "me" ? "self-end bg-gradient-primary text-primary-foreground" : "self-start bg-card"}`}>{m.text}</p>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onSend(text.trim()); setText(""); } }}
        className="sticky bottom-20 mt-4 flex gap-2"
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1 rounded-full border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <button aria-label="Send" className="grid h-12 w-12 place-items-center rounded-full bg-gradient-primary text-primary-foreground"><Send className="h-5 w-5" /></button>
      </form>
    </div>
  );
}
