# News Feed MVP

This is the small MVP extracted from the original AI threat intelligence bulletin project.

It is now shaped for incident-response monitoring:

- Poll vendor/security RSS feeds every 5 minutes.
- Look back 120 minutes by default, covering a 1.5-hour response target plus feed delay.
- Track seen article links so each article is surfaced once.
- Write machine-readable and human-readable outputs into `data/`.

It intentionally removes the larger pieces from the original project: n8n automation, Supabase, Gemini summarization, Discord delivery, screenshots, and the full Docker stack.

## Requirements

- Node.js 18 or newer.

No package install is required for the MVP.

## Run Once

```bash
npm run scan
```

or:

```bash
npm start
```

Outputs:

- `data/latest-scan.json`
- `data/latest-new-articles.md`
- timestamped `data/scan-*.json`
- `data/seen-articles.json`

## Watch Every 5 Minutes

```bash
npm run watch
```

The watcher prints only new articles after deduping against `data/seen-articles.json`.

## Configure Vendor Feeds

Copy the example environment file:

```bash
cp .env.example .env
```

Useful settings:

- `FEED_SCAN_INTERVAL_SECONDS=300` scans every 5 minutes.
- `FEED_LOOKBACK_MINUTES=120` keeps articles published in the last 2 hours.
- `FEED_OUTPUT_DIR=data` chooses where output files go.
- `FEED_STATE_FILE=data/seen-articles.json` stores seen article links.

Set your vendor RSS feed with `FEED_URLS`:

```bash
FEED_URLS="Vendor Name|https://vendor.example.com/security/rss|https://vendor.example.com/"
```

Multiple feeds use commas:

```bash
FEED_URLS="Vendor A|https://a.example.com/rss|https://a.example.com/,Vendor B|https://b.example.com/feed.xml|https://b.example.com/"
```

If `FEED_URLS` is empty, the MVP uses the original project feeds:

- Bleeping Computer: `https://www.bleepingcomputer.com/feed/`
- The Hacker News: `https://feeds.feedburner.com/TheHackersNews`
- Dark Reading: `https://www.darkreading.com/rss.xml`

## Test

```bash
npm test
```

## Do We Need An LLM?

Not for monitoring. For the first incident-response MVP, the important job is:

```text
fetch vendor feed -> detect new article -> alert quickly
```

Add an LLM later only if you want automatic triage, summarization, severity scoring, affected-product extraction, or deduping across multiple sources.
