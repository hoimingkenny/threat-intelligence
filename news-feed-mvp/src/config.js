export const defaultFeeds = [
  {
    name: "Bleeping Computer",
    url: "https://www.bleepingcomputer.com/feed/",
    homepage: "https://www.bleepingcomputer.com/",
  },
  {
    name: "The Hacker News",
    url: "https://feeds.feedburner.com/TheHackersNews",
    homepage: "https://thehackernews.com/",
  },
  {
    name: "Dark Reading",
    url: "https://www.darkreading.com/rss.xml",
    homepage: "https://www.darkreading.com/",
  },
];

export function getFeeds(value = process.env.FEED_URLS) {
  if (!value?.trim()) return defaultFeeds;

  return value
    .split(",")
    .map((entry) => parseFeedEntry(entry.trim()))
    .filter(Boolean);
}

export function getLookbackDays(value = process.env.FEED_LOOKBACK_DAYS) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
}

export function getLookbackMinutes(value = process.env.FEED_LOOKBACK_MINUTES) {
  const parsed = Number.parseInt(value ?? "120", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 120;
}

export function getOutputDir(value = process.env.FEED_OUTPUT_DIR) {
  return value || "data";
}

export function getScanIntervalMs(value = process.env.FEED_SCAN_INTERVAL_SECONDS) {
  const parsed = Number.parseInt(value ?? "300", 10);
  const seconds = Number.isFinite(parsed) && parsed > 0 ? parsed : 300;
  return seconds * 1000;
}

export function getStateFile(value = process.env.FEED_STATE_FILE) {
  return value || "data/seen-articles.json";
}

function parseFeedEntry(entry) {
  if (!entry) return null;

  const parts = entry.split("|").map((part) => part.trim());
  if (parts.length === 1) {
    return {
      name: hostnameLabel(parts[0]),
      url: parts[0],
      homepage: homepageFromUrl(parts[0]),
    };
  }

  return {
    name: parts[0],
    url: parts[1],
    homepage: parts[2] || homepageFromUrl(parts[1]),
  };
}

function hostnameLabel(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "Vendor Feed";
  }
}

function homepageFromUrl(value) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.hostname}/`;
  } catch {
    return value;
  }
}
