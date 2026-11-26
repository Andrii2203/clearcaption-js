// ClearCaption: YouTube transcripts from any server (Node 18+, browsers, Deno, Bun, edge). Zero dependencies.
// Same shape as youtube-transcript-api: [{ text, start, duration }]. Runs on Apify, so cloud IPs are not blocked.
//   import { fetchTranscript } from "clearcaption";
//   await fetchTranscript("dQw4w9WgXcQ", { token: process.env.APIFY_TOKEN, translateTo: "de" });
// Pricing: $0.005 per video with captions, $0 without captions; ~1,000 videos/month fit Apify's free plan.

const ACTOR = "clearcaption~youtube-transcript-translate";
const API = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items`;

export class TranscriptError extends Error {
  constructor(status, videoId) {
    super(`${videoId}: ${status}`);
    this.name = "TranscriptError";
    this.status = status;
    this.videoId = videoId;
  }
}

const toSegments = (segs) => (segs || []).map((s) => ({ text: s.text, start: s.start, duration: s.dur }));

/** videos: ids or URLs (also channel / playlist URLs) -> { videoId: segments | TranscriptError } */
export async function fetchMany(videos, { token, translateTo, signal } = {}) {
  token = token || (typeof process !== "undefined" ? process.env.APIFY_TOKEN : undefined);
  if (!token) throw new Error("APIFY_TOKEN is missing (free account: https://console.apify.com/sign-up)");
  const body = { videos: [...videos], outputFormats: ["segments"], includeTimestamps: true };
  if (translateTo) body.targetLanguage = translateTo;
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    signal,
  });
  if (!r.ok) throw new Error(`Apify HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const out = {};
  for (const item of await r.json()) {
    const id = item.videoId || item.input;
    if (item.status !== "OK") { out[id] = new TranscriptError(item.status, id); continue; }
    const tr = item.translation || {};
    if (translateTo && !(tr.segments && tr.segments.length)) { out[id] = new TranscriptError(`TRANSLATION_UNAVAILABLE:${translateTo}`, id); continue; }
    out[id] = toSegments(translateTo ? tr.segments : item.segments);
  }
  return out;
}

/** one video -> [{ text, start, duration }] */
export async function fetchTranscript(video, opts = {}) {
  const res = await fetchMany([video], opts);
  const seg = Object.values(res)[0];
  if (!seg) throw new TranscriptError("NO_RESULT", video);
  if (seg instanceof Error) throw seg;
  return seg;
}
