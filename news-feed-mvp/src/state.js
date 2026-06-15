import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function loadSeenLinks(path) {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed.seenLinks) ? parsed.seenLinks : []);
  } catch (error) {
    if (error.code === "ENOENT") return new Set();
    throw error;
  }
}

export async function saveSeenLinks(path, seenLinks) {
  await mkdir(dirname(path), { recursive: true });
  const sortedLinks = [...seenLinks].sort();
  await writeFile(path, `${JSON.stringify({ updatedAt: new Date().toISOString(), seenLinks: sortedLinks }, null, 2)}\n`);
}

export function articleKey(article) {
  try {
    const url = new URL(article.link);
    url.hash = "";
    return url.toString();
  } catch {
    return article.link || article.title;
  }
}

export function findNewArticles(articles, seenLinks) {
  return articles.filter((article) => !seenLinks.has(articleKey(article)));
}

export function markArticlesSeen(articles, seenLinks) {
  for (const article of articles) {
    seenLinks.add(articleKey(article));
  }
}
