import test from "node:test";
import assert from "node:assert/strict";
import { getFeeds, getScanIntervalMs } from "../src/config.js";

test("getFeeds parses vendor feed URLs", () => {
  const feeds = getFeeds("Vendor A|https://a.example.com/rss|https://a.example.com/,https://b.example.com/feed.xml");

  assert.deepEqual(feeds, [
    {
      name: "Vendor A",
      url: "https://a.example.com/rss",
      homepage: "https://a.example.com/",
    },
    {
      name: "b.example.com",
      url: "https://b.example.com/feed.xml",
      homepage: "https://b.example.com/",
    },
  ]);
});

test("getScanIntervalMs defaults to five minutes", () => {
  assert.equal(getScanIntervalMs(undefined), 300000);
});
