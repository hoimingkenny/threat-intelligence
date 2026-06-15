import test from "node:test";
import assert from "node:assert/strict";
import { dedupeArticles, fetchFeed, filterArticlesByAgeMinutes, filterArticlesByLookbackDay, parseFeed } from "../src/rss.js";

test("parseFeed normalizes RSS entries", () => {
  const articles = parseFeed(
    `<?xml version="1.0"?>
    <rss><channel>
      <item>
        <title><![CDATA[Example &amp; Threat]]></title>
        <link>https://example.com/threat#section</link>
        <pubDate>Sun, 14 Jun 2026 10:00:00 GMT</pubDate>
        <description><![CDATA[<p>Important update</p>]]></description>
      </item>
    </channel></rss>`,
    { name: "Example Feed" },
  );

  assert.deepEqual(articles, [
    {
      source: "Example Feed",
      title: "Example & Threat",
      link: "https://example.com/threat#section",
      publishedAt: "2026-06-14T10:00:00.000Z",
      content: "Important update",
    },
  ]);
});

test("filterArticlesByLookbackDay keeps yesterday articles", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");
  const articles = [
    { title: "Keep", link: "https://example.com/keep", publishedAt: "2026-06-14T23:59:00.000Z" },
    { title: "Skip", link: "https://example.com/skip", publishedAt: "2026-06-13T23:59:00.000Z" },
  ];

  assert.deepEqual(filterArticlesByLookbackDay(articles, 1, now), [articles[0]]);
});

test("filterArticlesByAgeMinutes keeps articles in the incident window", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");
  const articles = [
    { title: "Keep", link: "https://example.com/keep", publishedAt: "2026-06-15T10:30:00.000Z" },
    { title: "Too Old", link: "https://example.com/old", publishedAt: "2026-06-15T09:59:59.000Z" },
    { title: "Future", link: "https://example.com/future", publishedAt: "2026-06-15T12:00:01.000Z" },
  ];

  assert.deepEqual(filterArticlesByAgeMinutes(articles, 90, now), [articles[0]]);
});

test("dedupeArticles removes duplicate links ignoring fragments", () => {
  const articles = [
    { title: "One", link: "https://example.com/a#one" },
    { title: "Two", link: "https://example.com/a#two" },
  ];

  assert.deepEqual(dedupeArticles(articles), [articles[0]]);
});

test("fetchFeed retries blocked responses with browser-style headers", async () => {
  const calls = [];
  const feed = {
    name: "Blocked Feed",
    url: "https://example.com/feed.xml",
    homepage: "https://example.com/",
  };
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) {
      return {
        ok: false,
        status: 403,
      };
    }

    return {
      ok: true,
      status: 200,
      text: async () => `<?xml version="1.0"?>
        <rss><channel>
          <item>
            <title>Retry Worked</title>
            <link>https://example.com/retry</link>
            <pubDate>Sun, 14 Jun 2026 10:00:00 GMT</pubDate>
            <description>Fetched after retry</description>
          </item>
        </channel></rss>`,
    };
  };

  const articles = await fetchFeed(feed, fetchImpl);

  assert.equal(calls.length, 2);
  assert.equal(calls[1].options.headers.referer, "https://example.com/");
  assert.match(calls[1].options.headers["user-agent"], /Mozilla/);
  assert.equal(articles[0].title, "Retry Worked");
});
