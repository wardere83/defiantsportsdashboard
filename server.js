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
let bracketCache = null;

// ESPN's public soccer API powers live World Cup scores. No key required;
// it returns the same results as FIFA's official tables. Configurable so the
// window can be widened to the knockouts or pointed at a season slug.
const WC_LEAGUE = process.env.WC_LEAGUE || "fifa.world";
const WC_START = process.env.WC_START || "20260611";
const WC_END = process.env.WC_END || "20260627";

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

// Static reference data — keeps the dashboard fully data-driven and
// makes integration tests and external partner clients possible.
const hostCities = [
  { city: "Atlanta", country: "USA", venue: "Atlanta Stadium", cap: 75000, role: "Group · R32 · R16 · Semi-final", lat: 33.755, lng: -84.401 },
  { city: "Boston", country: "USA", venue: "Boston Stadium", cap: 65000, role: "Group · R32 · Quarter-final", lat: 42.091, lng: -70.164 },
  { city: "Dallas", country: "USA", venue: "Dallas Stadium", cap: 94000, role: "Group · R32 · R16 · Semi-final", lat: 32.748, lng: -97.093 },
  { city: "Guadalajara", country: "Mexico", venue: "Estadio Guadalajara", cap: 48000, role: "Group stage", lat: 20.682, lng: -103.462 },
  { city: "Houston", country: "USA", venue: "Houston Stadium", cap: 72000, role: "Group · R32 · R16", lat: 29.684, lng: -95.411 },
  { city: "Kansas City", country: "USA", venue: "Kansas City Stadium", cap: 73000, role: "Group · R32 · Quarter-final", lat: 39.049, lng: -94.484 },
  { city: "Los Angeles", country: "USA", venue: "Los Angeles Stadium", cap: 70000, role: "Group · R32 · Quarter-final", lat: 33.953, lng: -118.339 },
  { city: "Mexico City", country: "Mexico", venue: "Estadio Azteca", cap: 83000, role: "Opening · Group · R32 · R16", lat: 19.303, lng: -99.151 },
  { city: "Miami", country: "USA", venue: "Miami Stadium", cap: 65000, role: "Group · R32 · QF · 3rd-place", lat: 25.958, lng: -80.239 },
  { city: "Monterrey", country: "Mexico", venue: "Estadio Monterrey", cap: 53500, role: "Group · R32", lat: 25.669, lng: -100.244 },
  { city: "New York/NJ", country: "USA", venue: "MetLife Stadium", cap: 82500, role: "Group · R32 · R16 · Final", lat: 40.813, lng: -74.874 },
  { city: "Philadelphia", country: "USA", venue: "Philadelphia Stadium", cap: 69000, role: "Group · R16", lat: 39.901, lng: -75.168 },
  { city: "SF Bay Area", country: "USA", venue: "Bay Area Stadium", cap: 71000, role: "Group · R32", lat: 37.403, lng: -121.970 },
  { city: "Seattle", country: "USA", venue: "Seattle Stadium", cap: 69000, role: "Group · R32 · R16", lat: 47.595, lng: -122.331 },
  { city: "Toronto", country: "Canada", venue: "BMO Field", cap: 45000, role: "Group · R32", lat: 43.633, lng: -79.418 },
  { city: "Vancouver", country: "Canada", venue: "BC Place", cap: 54000, role: "Group · R32 · R16", lat: 49.276, lng: -123.111 },
];

function impactSummary() {
  const totalCap = hostCities.reduce((s, x) => s + x.cap, 0);
  const avgCap = totalCap / hostCities.length;
  const matches = 104;
  const projectedReach = Math.round(avgCap * 0.95 * matches);
  return {
    hostCities: hostCities.length,
    countries: 3,
    teams: 48,
    matches,
    totalSeats: totalCap,
    averageCapacity: Math.round(avgCap),
    projectedFanReach: projectedReach,
    projectedFanReachPretty: `${(projectedReach / 1e6).toFixed(1)}M+`,
    languagesSupported: 5,
  };
}

app.disable("x-powered-by");

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Defiant Sports World Cup 2026 Dashboard",
    version: "1.1.0",
    uptimeSec: Math.round(process.uptime()),
    cache: {
      live: Boolean(liveFeedCache && liveFeedCache.expiresAt > Date.now()),
      grants: Boolean(grantFeedCache && grantFeedCache.expiresAt > Date.now()),
      ttlMs: CACHE_TTL_MS,
    },
    generatedAt: new Date().toISOString(),
  });
});

app.get("/api/host-cities", (_req, res) => {
  res.json({
    generatedAt: new Date().toISOString(),
    count: hostCities.length,
    cities: hostCities,
  });
});

app.get("/api/impact", (_req, res) => {
  res.json({
    generatedAt: new Date().toISOString(),
    ...impactSummary(),
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

// ── Live World Cup scores from ESPN (server-side proxy, avoids browser CORS) ──
function ymdRange(start, end) {
  const toDate = (s) => new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));
  const days = [];
  for (let d = toDate(start), last = toDate(end); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    days.push(`${y}${m}${day}`);
  }
  return days;
}

function parseEspnScoreboard(json) {
  const out = [];
  const events = (json && json.events) || [];
  for (const ev of events) {
    const comp = ev.competitions && ev.competitions[0];
    if (!comp) continue;
    const cs = comp.competitors || [];
    const home = cs.find((c) => c.homeAway === "home") || cs[0];
    const away = cs.find((c) => c.homeAway === "away") || cs[1];
    if (!home || !away) continue;
    const st = (comp.status && comp.status.type) || (ev.status && ev.status.type) || {};
    const hs = home.score === 0 || home.score ? Number(home.score) : NaN;
    const as = away.score === 0 || away.score ? Number(away.score) : NaN;
    out.push({
      date: comp.date || ev.date || null,
      home: (home.team && (home.team.displayName || home.team.name)) || "",
      away: (away.team && (away.team.displayName || away.team.name)) || "",
      homeScore: Number.isFinite(hs) ? hs : null,
      awayScore: Number.isFinite(as) ? as : null,
      state: st.state || null,
      completed: Boolean(st.completed),
    });
  }
  return out;
}

async function fetchEspnDay(ymd) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${WC_LEAGUE}/scoreboard?dates=${ymd}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "DefiantSportsWorldCupDashboard/1.0 (+https://defiantsports.io)",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseEspnScoreboard(await response.json());
}

async function buildBracketPayload() {
  const results = await Promise.allSettled(ymdRange(WC_START, WC_END).map(fetchEspnDay));
  const matches = [];
  const seen = new Set();
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const m of result.value) {
      const key = `${m.home}|${m.away}|${m.date || ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push(m);
    }
  }
  return {
    generatedAt: new Date().toISOString(),
    source: "ESPN",
    league: WC_LEAGUE,
    count: matches.length,
    matches,
  };
}

app.get("/api/worldcup-bracket", async (_req, res, next) => {
  try {
    if (bracketCache && bracketCache.expiresAt > Date.now()) {
      return res.json(bracketCache.payload);
    }
    const payload = await buildBracketPayload();
    if (!payload.matches.length) throw new Error("No live matches returned from ESPN");
    bracketCache = { expiresAt: Date.now() + CACHE_TTL_MS, payload };
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
