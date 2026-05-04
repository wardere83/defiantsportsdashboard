# Live Source Register

The dashboard server checks the following verified endpoints at runtime
and surfaces their live status, latency, and any returned items in the
UI. Nothing in this file is mocked.

## Tournament & travel-health feeds (`/api/live-feeds`)

- CDC Travel Notices RSS, `https://wwwnc.cdc.gov/travel/rss/notices.xml`
- FIFA Scores & Fixtures, `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures`
- FIFA Teams, `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams`
- FIFA Tournament Facts, `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/fifa-world-cup-2026-hosts-cities-dates-usa-mexico-canada`

## Grant & program feeds (`/api/grant-feeds`)

- Seattle Small Sparks Fund, `https://frontporch.seattle.gov/2026/01/23/bring-your-community-together-small-sparks-grants-available-to-support-community-events/`
- LA84 Foundation Grants, `https://www.la84.org/grants`
- Atlanta United Foundation GA 100, `https://www.atlutd.com/community/atlanta-united-foundation/ga-100-faqs`
- U.S. Soccer Foundation Safe Places to Play, `https://ussoccerfoundation.org/programs/safe-places-to-play/`

## Static reference endpoints

- `/api/host-cities`, verified 16-city register sourced from FIFA's
  published host list (cached in-process; no external call).
- `/api/impact`, computed impact metrics derived from the host-city
  register (no external call).
- `/api/health`, service heartbeat.

## Caching

Live and grant payloads are cached in-process for `CACHE_TTL_MS`
milliseconds (default 5 minutes). Static endpoints (`/api/health`,
`/api/host-cities`, `/api/impact`) respond immediately.

## Accuracy standard

The app reports endpoint status, latency, and the message returned by
the source. It does not create fake grant opportunities, sample news
items, or invented match results.
