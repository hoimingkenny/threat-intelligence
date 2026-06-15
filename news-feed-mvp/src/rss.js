const XML_ENTITIES = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: "\"",
};

const DEFAULT_HEADERS = {
  "user-agent": "news-feed-mvp/0.1 (+local MVP)",
  accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
};

const BROWSER_HEADERS = {
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
};

const RETRYABLE_HTTP_STATUSES = new Set([403, 408, 429, 500, 502, 503, 504]);

export async function fetchFeed(feed, fetchImpl = fetch) {
  let response = await fetchFeedResponse(feed, DEFAULT_HEADERS, fetchImpl);

  if (!response.ok && RETRYABLE_HTTP_STATUSES.has(response.status)) {
    response = await fetchFeedResponse(feed, { ...BROWSER_HEADERS, referer: feed.homepage ?? feed.url }, fetchImpl);
  }

  if (!response.ok) {
    throw new Error(`${feed.name} returned HTTP ${response.status}`);
  }

  const xml = await response.text();
  return parseFeed(xml, feed);
}

async function fetchFeedResponse(feed, headers, fetchImpl) {
  return fetchImpl(feed.url, {
    headers: {
      ...headers,
    },
  });
}

export function parseFeed(xml, feed) {
  const blocks = [...matchBlocks(xml, "item"), ...matchBlocks(xml, "entry")];

  return blocks
    .map((block) => normalizeEntry(block, feed))
    .filter((article) => article.title && article.link);
}

export function filterArticlesByLookbackDay(articles, lookbackDays, now = new Date()) {
  const target = toDateKey(addUtcDays(now, -lookbackDays));

  return articles.filter((article) => {
    if (!article.publishedAt) return false;
    return toDateKey(new Date(article.publishedAt)) === target;
  });
}

export function filterArticlesByAgeMinutes(articles, minutes, now = new Date()) {
  const newestAllowed = now.getTime();
  const oldestAllowed = newestAllowed - minutes * 60 * 1000;

  return articles.filter((article) => {
    if (!article.publishedAt) return false;

    const publishedAt = new Date(article.publishedAt).getTime();
    return Number.isFinite(publishedAt) && publishedAt >= oldestAllowed && publishedAt <= newestAllowed;
  });
}

export function dedupeArticles(articles) {
  const seen = new Set();
  const unique = [];

  for (const article of articles) {
    const key = normalizeUrl(article.link) || article.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(article);
  }

  return unique;
}

function normalizeEntry(block, feed) {
  const link = readLink(block);
  const publishedAt = readFirst(block, ["isoDate", "pubDate", "published", "updated", "dc:date"]);
  const content = readFirst(block, [
    "content:encoded",
    "content",
    "description",
    "summary",
  ]);

  return {
    source: feed.name,
    title: cleanText(readFirst(block, ["title"])),
    link: cleanText(link),
    publishedAt: publishedAt ? new Date(cleanText(publishedAt)).toISOString() : null,
    content: cleanArticleContent(content),
  };
}

function* matchBlocks(xml, tagName) {
  const pattern = new RegExp(`<${escapeRegExp(tagName)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeRegExp(tagName)}>`, "gi");
  let match;

  while ((match = pattern.exec(xml)) !== null) {
    yield match[1];
  }
}

function readFirst(block, tagNames) {
  for (const tagName of tagNames) {
    const value = readTag(block, tagName);
    if (value) return value;
  }

  return "";
}

function readTag(block, tagName) {
  const pattern = new RegExp(`<${escapeRegExp(tagName)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeRegExp(tagName)}>`, "i");
  const match = block.match(pattern);
  return match ? unwrapCdata(match[1]).trim() : "";
}

function readLink(block) {
  const rssLink = readTag(block, "link");
  if (rssLink) return rssLink;

  const atomLink = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  return atomLink ? atomLink[1] : "";
}

function cleanArticleContent(value) {
  return cleanText(value)
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value) {
  return decodeEntities(stripTags(unwrapCdata(value))).trim();
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ");
}

function unwrapCdata(value) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function decodeEntities(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity) => {
    if (entity[0] === "#") {
      const radix = entity[1]?.toLowerCase() === "x" ? 16 : 10;
      const digits = radix === 16 ? entity.slice(2) : entity.slice(1);
      const codePoint = Number.parseInt(digits, radix);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : `&${entity};`;
    }

    return XML_ENTITIES[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString();
  } catch {
    return value;
  }
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
