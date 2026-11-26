# clearcaption (JavaScript / TypeScript)

YouTube transcripts that work from servers: AWS, GCP, Vercel, Cloudflare Workers, Render. Zero dependencies, Node 18+, Deno, Bun.
Direct scraping of YouTube from cloud IPs gets `429` / "Sign in to confirm you're not a bot"; this client runs the request on Apify's rotating proxies instead.

**Free:** ~1,000 videos/month with a free Apify account ($5 monthly credit, no credit card). After that $0.005 per video with captions; videos without captions are $0.

```bash
npm install clearcaption
export APIFY_TOKEN=...   # https://console.apify.com/sign-up
```

```js
import { fetchTranscript, fetchMany } from "clearcaption";

const segments = await fetchTranscript("dQw4w9WgXcQ");             // [{ text, start, duration }]
const german = await fetchTranscript("dQw4w9WgXcQ", { translateTo: "de" }); // translated, timestamps kept
const many = await fetchMany(["https://www.youtube.com/@freecodecamp"]);     // channels and playlists too
```

Same output shape as Python's `youtube-transcript-api`, so it is a drop-in for JS projects.

- Python client: [clearcaption-youtube-transcript](https://github.com/Andrii2203/clearcaption-youtube-transcript)
- No-code / SRT / VTT / MCP server for AI agents: [Apify Store](https://apify.com/clearcaption/youtube-transcript-translate)

MIT license.
