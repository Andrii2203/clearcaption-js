#!/usr/bin/env node
// CLI: npx clearcaption VIDEO [VIDEO ...] [--to de] [--srt | --json]   (needs APIFY_TOKEN)
import { fetchMany } from "./index.js";

const args = process.argv.slice(2);
if (!args.length || args.includes("-h") || args.includes("--help")) {
  console.log(`Usage: clearcaption VIDEO [VIDEO ...] [--to LANG] [--srt | --json]

  VIDEO     YouTube video / channel / playlist URL or video ID
  --to      translate to language code (de, es, uk ...), timestamps kept
  --srt     print SRT subtitles
  --json    print raw segments as JSON lines

Needs APIFY_TOKEN (free account: https://console.apify.com/sign-up)`);
  process.exit(args.length ? 0 : 1);
}

const videos = [];
let translateTo, mode = "text";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--to") translateTo = args[++i];
  else if (args[i] === "--srt") mode = "srt";
  else if (args[i] === "--json") mode = "json";
  else videos.push(args[i]);
}

const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

try {
  const res = await fetchMany(videos, { translateTo });
  for (const [id, seg] of Object.entries(res)) {
    if (seg instanceof Error) { console.error(`# ${id}: ${seg.status}`); continue; }
    if (mode === "json") console.log(JSON.stringify({ [id]: seg }));
    else if (mode === "srt") seg.forEach((s, i) => console.log(`${i + 1}\n${ts(s.start)} --> ${ts(s.start + s.duration)}\n${s.text}\n`));
    else console.log(`# ${id}\n${seg.map((s) => s.text).join(" ")}\n`);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
