import type { ReactNode } from "react";

export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold">{title}</h1>
      <div className="mt-8 space-y-4 leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground">{children}</div>
    </div>
  );
}

export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} — Ready Too Mingle` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — Ready Too Mingle` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
