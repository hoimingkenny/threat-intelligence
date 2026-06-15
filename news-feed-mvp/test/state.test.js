import test from "node:test";
import assert from "node:assert/strict";
import { articleKey, findNewArticles, markArticlesSeen } from "../src/state.js";

test("articleKey ignores URL fragments", () => {
  assert.equal(articleKey({ link: "https://example.com/a#section" }), "https://example.com/a");
});

test("findNewArticles returns only unseen articles", () => {
  const seenLinks = new Set(["https://example.com/old"]);
  const articles = [
    { title: "Old", link: "https://example.com/old#fragment" },
    { title: "New", link: "https://example.com/new" },
  ];

  assert.deepEqual(findNewArticles(articles, seenLinks), [articles[1]]);
});

test("markArticlesSeen stores article keys", () => {
  const seenLinks = new Set();
  markArticlesSeen([{ title: "New", link: "https://example.com/new#fragment" }], seenLinks);

  assert.deepEqual([...seenLinks], ["https://example.com/new"]);
});
