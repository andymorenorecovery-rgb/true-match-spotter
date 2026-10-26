import { createFileRoute } from "@tanstack/react-router";

// Checks an ad's selfie video: a real face must be clearly visible in every
// sampled frame, and it must be the same person as the ad's main photo.
// Public route (posting works without an account), so inputs are size-capped.
// Self-hosted servers have no LOVABLE_API_KEY and relay to the hosted copy.

const MAX_BODY = 3_000_000;
const RELAY_DEFAULT = "https://true-match-spotter.lovable.app/api/public/verify-selfie";

type Body = { frames: string[]; photo: string };

function valid(b: unknown): b is Body {
  const x = b as Body;
  const img = (s: unknown) => typeof s === "string" && (s.startsWith("data:image/") || s.startsWith("https://"));
  return !!x && Array.isArray(x.frames) && x.frames.length >= 3 && x.frames.length <= 8 && x.frames.every(img) && img(x.photo);
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

export const Route = createFileRoute("/api/public/verify-selfie")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const text = await request.text();
        if (text.length > MAX_BODY) return json({ error: "too_big" }, 413);
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          const up = await fetch(process.env["SELFIE_CHECK_RELAY_URL"] ?? RELAY_DEFAULT, {
            method: "POST", headers: { "content-type": "application/json" }, body: text,
          });
          return new Response(up.body, { status: up.status, headers: { "content-type": "application/json" } });
        }
        let body: unknown;
        try { body = JSON.parse(text); } catch { return json({ error: "bad_request" }, 400); }
        if (!valid(body)) return json({ error: "bad_request" }, 400);

        const content = [
          {
            type: "input_text",
            text:
              `Image 1 is the profile photo from a dating ad. Images 2-${body.frames.length + 1} are frames taken across a selfie video the same person recorded live. ` +
              "Decide: (a) faceInEveryFrame: is one real person's face clearly visible (not covered, not black/dark, not a wall, not pointed away, not a photo of a screen or printed picture) in EVERY video frame? " +
              "(b) samePerson: is the person in the video the same person as in the profile photo? Be strict but allow for different lighting, angles, makeup and hair. " +
              "Give a short friendly reason addressed to the poster if either is false.",
          },
          { type: "input_image", image_url: body.photo },
          ...body.frames.map((f) => ({ type: "input_image", image_url: f })),
        ];
        const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            reasoning: { effort: "low" },
            input: [{ role: "user", content }],
            text: {
              format: {
                type: "json_schema", name: "selfie_check", strict: true,
                schema: {
                  type: "object", additionalProperties: false,
                  required: ["faceInEveryFrame", "samePerson", "reason"],
                  properties: { faceInEveryFrame: { type: "boolean" }, samePerson: { type: "boolean" }, reason: { type: "string" } },
                },
              },
            },
          }),
        });
        if (!res.ok) return json({ error: "check_unavailable", status: res.status }, 502);
        const out = (await res.json()) as { output_text?: string; output?: { content?: { type: string; text?: string }[] }[] };
        const raw = out.output_text ?? out.output?.flatMap((o) => o.content ?? []).find((c) => c.type === "output_text")?.text ?? "";
        try {
          const r = JSON.parse(raw) as { faceInEveryFrame: boolean; samePerson: boolean; reason: string };
          return json({ ok: r.faceInEveryFrame && r.samePerson, ...r });
        } catch {
          return json({ error: "check_unavailable" }, 502);
        }
      },
    },
  },
});
