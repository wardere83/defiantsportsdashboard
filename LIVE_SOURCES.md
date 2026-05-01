# Live Source Register

The dashboard server checks the following verified endpoints at runtime.

## Tournament and health feeds

- CDC Travel Notices RSS: `https://wwwnc.cdc.gov/travel/rss/notices.xml`
- FIFA Scores & Fixtures: `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures`
- FIFA Teams: `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams`
- FIFA Tournament Facts: `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/fifa-world-cup-2026-hosts-cities-dates-usa-mexico-canada`

## Grant and program feeds

- Seattle Small Sparks Fund: `https://frontporch.seattle.gov/2026/01/23/bring-your-community-together-small-sparks-grants-available-to-support-community-events/`
- LA84 Foundation Grants: `https://www.la84.org/grants`
- Atlanta United Foundation GA 100: `https://www.atlutd.com/community/atlanta-united-foundation/ga-100-faqs`
- U.S. Soccer Foundation Safe Places to Play: `https://ussoccerfoundation.org/programs/safe-places-to-play/`

## Accuracy standard

The app checks these endpoints live and reports the endpoint status, latency, and message returned by the server. It does not create fake grant opportunities or sample news items.
