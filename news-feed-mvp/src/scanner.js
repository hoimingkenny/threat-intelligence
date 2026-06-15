import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { dedupeArticles, fetchFeed, filterArticlesByAgeMinutes } from "./rss.js";
import { findNewArticles, loadSeenLinks, markArticlesSeen, saveSeenLinks } from "./state.js";

export async function scanFeeds({ feeds, outputDir, stateFile, lookbackMinutes, now = new Date() }) {
  const results = await Promise.allSettled(feeds.map((feed) => fetchFeed(feed)));
  const failures = results
    .map((result, index) => ({ result, feed: feeds[index] }))
    .filter(({ result }) => result.status === "rejected");

  const allArticles = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const recentArticles = dedupeArticles(filterArticlesByAgeMinutes(allArticles, lookbackMinutes, now));
  const seenLinks = await loadSeenLinks(stateFile);
  const newArticles = findNewArticles(recentArticles, seenLinks);

  markArticlesSeen(recentArticles, seenLinks);
  await saveSeenLinks(stateFile, seenLinks);
  await writeScanOutputs({ outputDir, now, lookbackMinutes, allArticles, recentArticles, newArticles, failures });

  return {
    scannedAt: now.toISOString(),
    feedCount: feeds.length,
    successfulFeedCount: feeds.length - failures.length,
    totalArticleCount: allArticles.length,
    recentArticleCount: recentArticles.length,
    newArticleCount: newArticles.length,
    newArticles,
    failures: summarizeFailures(failures),
  };
}

export async function writeScanOutputs({ outputDir, now, lookbackMinutes, allArticles, recentArticles, newArticles, failures }) {
  await mkdir(outputDir, { recursive: true });

  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  const jsonPath = join(outputDir, `scan-${timestamp}.json`);
  const latestJsonPath = join(outputDir, "latest-scan.json");
  const markdownPath = join(outputDir, "latest-new-articles.md");
  const payload = {
    scannedAt: now.toISOString(),
    lookbackMinutes,
    totalArticleCount: allArticles.length,
    recentArticleCount: recentArticles.length,
    newArticleCount: newArticles.length,
    newArticles,
    failures: summarizeFailures(failures),
  };

  await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(latestJsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(markdownPath, renderNewArticlesMarkdown(newArticles, now, lookbackMinutes));
}

export function renderNewArticlesMarkdown(articles, now, lookbackMinutes) {
  const lines = [
    `# New Vendor Hacking News - ${now.toISOString()}`,
    "",
    `Lookback window: ${lookbackMinutes} minutes`,
    `New article count: ${articles.length}`,
    "",
  ];

  for (const article of articles) {
    lines.push(`- **${article.title}** (${article.source})`);
    lines.push(`  Published: ${article.publishedAt ?? "unknown"}`);
    lines.push(`  Link: ${article.link}`);
    if (article.content) lines.push(`  ${article.content}`);
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function summarizeFailures(failures) {
  return failures.map(({ feed, result }) => ({
    source: feed.name,
    url: feed.url,
    error: result.reason.message,
  }));
}
