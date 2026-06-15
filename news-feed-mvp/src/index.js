import "./env.js";
import {
  getFeeds,
  getLookbackMinutes,
  getOutputDir,
  getScanIntervalMs,
  getStateFile,
} from "./config.js";
import { scanFeeds } from "./scanner.js";

async function main() {
  const options = {
    feeds: getFeeds(),
    outputDir: getOutputDir(),
    stateFile: getStateFile(),
    lookbackMinutes: getLookbackMinutes(),
  };

  if (process.argv.includes("--watch")) {
    await watch(options, getScanIntervalMs());
    return;
  }

  const result = await scanFeeds(options);
  printResult(result);
}

async function watch(options, intervalMs) {
  console.log(`Watching ${options.feeds.length} feed(s) every ${Math.round(intervalMs / 1000)} second(s).`);
  console.log(`Incident window: ${options.lookbackMinutes} minute(s). Press Ctrl+C to stop.`);

  await runWatchScan(options);
  setInterval(() => {
    runWatchScan(options).catch((error) => {
      console.error(`[${new Date().toISOString()}] scan failed: ${error.message}`);
    });
  }, intervalMs);
}

async function runWatchScan(options) {
  const result = await scanFeeds(options);
  printResult(result);

  if (result.newArticleCount > 0) {
    console.log("New article(s):");
    for (const article of result.newArticles) {
      console.log(`- ${article.title} (${article.source})`);
      console.log(`  ${article.link}`);
    }
  }
}

function printResult(result) {
  console.log(
    `[${result.scannedAt}] ${result.newArticleCount} new / ${result.recentArticleCount} recent / ${result.totalArticleCount} scanned article(s) from ${result.successfulFeedCount}/${result.feedCount} feed(s).`,
  );

  if (result.failures.length) {
    console.warn("Some feeds failed:");
    for (const failure of result.failures) {
      console.warn(`- ${failure.source}: ${failure.error}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
