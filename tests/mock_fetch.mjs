// local $0 test: fake Apify response, no network
globalThis.fetch = async (url, opts) => ({
  ok: true,
  json: async () => [
    { videoId: "abc", status: "OK", segments: [{ text: "Hello", start: 0, dur: 1.5 }, { text: "world", start: 61.25, dur: 2 }],
      translation: { segments: [{ text: "Hallo", start: 0, dur: 1.5 }] } },
    { videoId: "nocap", status: "NO_CAPTIONS" },
  ],
});
