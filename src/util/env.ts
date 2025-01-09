export const env = {
  DESTDIR: Deno.env.get("DESTDIR") ?? "subscriptions",
  WHITELIST: (Deno.env.get("WHITELIST") ?? "").split(",").filter(Boolean),
  BLACKLIST: (Deno.env.get("BLACKLIST") ?? "").split(",").filter(Boolean),
  YOUTUBE_DATA_API_KEY: Deno.env.get("YOUTUBE_DATA_API_KEY"),
};
