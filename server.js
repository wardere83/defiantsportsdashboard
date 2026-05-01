import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 5 * 60 * 1000);

let liveFeedCache = null;
let grantFeedCache = null;

const verifiedSources = [
  {
    name: "CDC Travel Notices RSS",
    url: "https://wwwnc.cdc.gov/travel/rss/notices.xml",
    category: "Travel health",
    type: "rss",
  },
  {
    name: "FIFA Scores & Fixtures",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures",
    category: "Match operations",
    type: "page",
  },
  {
    name: "FIFA Teams",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams",
    category: "Team intelligence",
    type: "page",
  },
  {
    name: "FIFA Tournament Facts",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/fifa-world-cup-2026-hosts-cities-dates-usa-mexico-canada",
    category: "Tournament facts",
    type: "page",
  },
];

const grantSources = [
  {
    name: "Seattle Small Sparks Fund",
    url: "https://frontporch.seattle.gov/2026/01/23/bring-your-community-together-small-sparks-grants-available-to-support-community-events/",
    category: "Open grant",
    type: "page",
  },
  {
    name: "LA84 Foundation Grants",
    url: "https://www.la84.org/grants",
    category: "Evergreen grant",
    type: "page",
  },
  {
    name: "Atlanta United Foundation GA 100",
    url: "https://www.atlutd.com/community/atlanta-united-foundation/ga-100-faqs",
    category: "Active program",
    type: "page",
  },
  {
    name: "U.S. Soccer Foundation Safe Places to Play",
    url: "https://ussoccerfoundation.org/programs/safe-places-to-play/",
    category: "Active program",
    type: "page",
  },
];

function decodeXml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagValue(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseRss(xml, sourceName, category) {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  return blocks.slice(0, 12).map((block, index) => {
    const title = tagValue(block, "title") || "Untitled update";
    const url = tagValue(block, "link");
    const guid = tagValue(block, "guid");
    const publishedAt = tagValue(block, "pubDate");

    return {
      id: `${sourceName}-${guid || url || index}`.replace(/\s+/g, "-").toLowerCase(),
      title,
      summary: tagValue(block, "description"),
      url,
      source: sourceName,
      publishedAt: publishedAt || null,
      category,
      verified: true,
    };
  });
}

async function checkSource(source) {
  const start = Date.now();

  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "DefiantSportsWorldCupDashboard/1.0 (+https://defiantsports.io)",
        Accept: source.type === "rss" ? "application/rss+xml, application/xml, text/xml" : "text/html,*/*",
      },
      signal: AbortSignal.timeout(9000),
    });

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      return {
        status: {
          name: source.name,
          url: source.url,
          category: source.category,
          status: "error",
          checkedAt: new Date().toISOString(),
          latencyMs,
          message: `HTTP ${response.status}`,
        },
        items: [],
      };
    }

    if (source.type === "rss") {
      const xml = await response.text();
      const items = parseRss(xml, source.name, source.category).filter((item) => item.title && item.url);

      return {
        status: {
          name: source.name,
          url: source.url,
          category: source.category,
          status: "live",
          checkedAt: new Date().toISOString(),
          latencyMs,
          itemCount: items.length,
          message: items.length ? "RSS items loaded" : "RSS source reachable with no current items",
        },
        items,
      };
    }

    await response.body?.cancel();

    return {
      status: {
        name: source.name,
        url: source.url,
        category: source.category,
        status: "reachable",
        checkedAt: new Date().toISOString(),
        latencyMs,
        message: "Verified endpoint reachable",
      },
      items: [],
    };
  } catch (error) {
    return {
      status: {
        name: source.name,
        url: source.url,
        category: source.category,
        status: "error",
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - start,
        message: error instanceof Error ? error.message : "Source request failed",
      },
      items: [],
    };
  }
}

async function buildPayload(sources) {
  const results = await Promise.all(sources.map((source) => checkSource(source)));

  return {
    generatedAt: new Date().toISOString(),
    sources: results.map((result) => result.status),
    items: results
      .flatMap((result) => result.items)
      .sort((a, b) => {
        const left = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const right = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return right - left;
      })
      .slice(0, 24),
  };
}

function cached(cache, setter, sources) {
  if (cache && cache.expiresAt > Date.now()) {
    return Promise.resolve(cache.payload);
  }

  return buildPayload(sources).then((payload) => {
    setter({ expiresAt: Date.now() + CACHE_TTL_MS, payload });
    return payload;
  });
}

app.disable("x-powered-by");

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Defiant Sports World Cup 2026 Dashboard",
    generatedAt: new Date().toISOString(),
  });
});

app.get("/api/live-feeds", async (_req, res, next) => {
  try {
    const payload = await cached(liveFeedCache, (value) => (liveFeedCache = value), verifiedSources);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

app.get("/api/grant-feeds", async (_req, res, next) => {
  try {
    const payload = await cached(grantFeedCache, (value) => (grantFeedCache = value), grantSources);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"],
  maxAge: "10m",
}));

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    error: "Live source request failed",
    message: error instanceof Error ? error.message : "Unknown server error",
  });
});

app.listen(PORT, () => {
  console.log(`Defiant Sports dashboard running on http://localhost:${PORT}`);
});
