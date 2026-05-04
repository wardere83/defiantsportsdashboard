---
name: defiant-dashboard
description: Maintain and extend the Defiant Sports World Cup 2026 dashboard. Use when the user asks to add a tab, change copy, swap a video or image, adjust the live FIFA card, fix mobile layout, work on translations, modify the Marathon Clothing or Branding pages, or open/merge PRs against this repo. Encodes file conventions (index.html mirrored to public/index.html, asset folders mirrored under assets/ + public/assets/), the GitHub PR workflow this repo uses, the brand voice rules, and the common pitfalls hit during the build.
---

# Defiant Sports Dashboard

Single-file HTML dashboard for FIFA World Cup 2026 host-city operations and partner branding. Every change runs through the same playbook below.

## File conventions

There are two copies of the dashboard HTML. They MUST stay byte-identical.

- `index.html` (repo root) — static preview / GitHub Pages copy.
- `public/index.html` — production copy served by `server.js` (Express).

After every edit to `index.html`, run:

```bash
cp index.html public/index.html
diff index.html public/index.html && echo "match"
```

Same mirror rule for assets:

- Drop files into both `assets/<folder>/` and `public/assets/<folder>/`.
- Folders in active use: `assets/` (root logo), `assets/marathon/`, `assets/pogba/`.

`server.js` resolves all `/assets/...` URLs from the `public/` tree.

## Workflow (commit → PR → merge)

1. Work on the user's branch: `claude/create-sports-dashboard-PPCPr`.
2. After edits, mirror to `public/index.html`, run a quick smoke test (`PORT=30xx node server.js &` then `curl -I /assets/...` for any new files).
3. Commit with a HEREDOC explaining **the why**, not the what. Example:

   ```bash
   git commit -m "$(cat <<'EOF'
   Marathon Clothing: prioritise nip.mp4 so Chrome/Firefox play it

   Browser support reality...
   EOF
   )"
   ```

4. Push: `git push origin claude/create-sports-dashboard-PPCPr`.
5. Open a PR via `mcp__github__create_pull_request` (base `main`, head `claude/create-sports-dashboard-PPCPr`).
6. Check `mcp__github__pull_request_read get_review_comments` (this repo has no CI configured — `mergeable_state: clean` is the green light).
7. Merge with `mcp__github__merge_pull_request` (`merge_method: "merge"`). The webhook will fire `unsubscribed`.

The user is fine with one PR per logical change set; small follow-ups in the same branch get bundled into the next PR.

## Brand voice rules

- **No em dashes (`—`) or en dashes (`–`) anywhere in user-visible copy.** Use commas, colons, periods, "to", or middle-dot `·` separators instead. The repo went through a full sweep removing 101 occurrences; do not reintroduce them.
- Apple-style aesthetic: Inter + JetBrains Mono, restrained green/blue accents on a black-and-white base, subtle elevation, hover lift.
- Factual fallback content only. The "no fabricated data" policy is real: do not invent live scores, fictitious match results, or made-up statistics. Static fallbacks should be verifiable facts (FIFA confirmed dates, venues, format).
- Translation matters. New copy should be short and self-contained because the page runs through Google Translate (cookie-driven) for 11 languages.

## Architecture quick reference

`index.html` is a single file with three sections:

1. `<head>` — preconnect / dns-prefetch hints, Google Fonts, Leaflet CSS, all CSS in one `<style>` block.
2. `<body>` — `.app` shell (sidebar `.rail` + `.content` with topbar + `.view`), the translation engine mount point, the toast div.
3. End-of-body inline `<script>` — all data, render functions, and event wiring. No build step.

### Sidebar / view system

- `views` array near the top of the script holds tab metadata: `[id, label, kbdLabel, glyph]`.
- Each tab has a matching `<section class="section" id="<id>">` placeholder.
- Each tab has a matching `render<Name>()` function called by the dispatcher in `renderActive()`.
- Add a new tab by inserting in three places: views array, sections list, render dispatcher. Then add a crumb description, optionally a keyboard shortcut, and update the README keyboard table.

### Hash routing

Active view persists in `location.hash`. `navigate(view)` writes the hash; `viewFromHash()` reads it on init; the `hashchange` listener handles back/forward. Do not call `state.view = ...` directly — always go through `navigate()` so the URL stays in sync.

### Live FIFA card

- The dark "Source Stream" card on Overview has the marquee ticker + 4 broadcast-style news panels (`.news-panel`) at the bottom.
- Panels rotate via `startNewsRotation()` — a setInterval per panel, staggered by 900ms, ticking every 5.2s.
- Panel data lives in `NEWS_FEEDS` (4 keys: `newsFixtures`, `newsTeams`, `newsFacts`, `newsTravel`). Keep individual items short (≤ ~80 chars) so they fit the locked 72px panel height.
- Marquee items live in `state.liveItems` (when `/api/live-feeds` is connected) or a hardcoded factual fallback inside `renderLiveCard()`.

### Headline strip (above the live card)

- Five rotating tabs celebrating Black entrepreneurship: Black Wall Street, Founders' Wisdom, Modern Mavericks, Milestones, Marathon Mindset.
- Data lives in `HEADLINE_FEEDS`; rotation handled by `startHeadlineRotation()` (7s cadence, 1100ms stagger).
- Items must fit a 96px tab at `font-size: 11px / line-height: 1.25` with 3-line clamp. Trim aggressively.

### Pogba Academy strip

- 6 photo tiles in a single row (5 was deprecated for symmetry). Defined by `POGBA_TILES`.
- Each tile uses local-first / Picsum-fallback pattern: `<img src="./assets/pogba/<file>" onerror="this.onerror=null; this.src='https://picsum.photos/...'">`.
- Per-tile `objectPosition` is supported (used on the Mathias mentorship tile to keep his face above the crop).

### Marathon Clothing tab

- Hero quote at top (uses `.marathon-hero` styles, dark gradient with green/gold glow).
- Two-column main grid that stacks at 980px and 720px.
- Side rail has the Nip Forever video card (HTML5 `<video>` autoplay/loop/muted/playsinline, `nip.mp4` first source then `nip.mov` then `nip.webm`), the Marathon Quotes rotator, and the Visit-the-Store card.
- `ensureVideoPlays()` runs after each render; it calls `.play()` and falls back to a one-shot user-gesture listener if the browser blocks autoplay.

### Branding tab

- Sales-oriented page pitching brand partnerships with the Defiant Sports roster.
- Sections: Hero, Why athlete branding works (6 cards), What Defiant Sports brings (6 cards), Beyond marketing → movement (3 cards: Social/Systemic/Industry), Partnership lanes (Spotlight/Movement/Legacy), CTA.

### Translation

- 11 languages defined in the `LANGUAGES` constant (en, es, fr, pt, ar, ti, so, zh-TW, ko, vi, tl).
- Topbar `<select id="languageSelect">` carries flag emoji + code.
- Picking a language calls `setPageLanguage(lang)` which:
  1. Sets `<html lang>` and `dir` (rtl for ar).
  2. Writes the `googtrans=/en/<lang>` cookie with `SameSite=Lax;` on `/`, the bare hostname, and `.hostname`.
  3. Polls briefly for `.goog-te-combo` and dispatches a `change` event for **in-place** translation (no reload, no browser tab spinner).
  4. Falls back to `location.reload()` only if the engine never loads.
- `retranslateIfNeeded()` runs after **every** `renderActive()` so SPA tab switches don't revert to English.
- Hidden mount point at `#google_translate_element` (off-screen via inline style); CSS suppresses every `goog-te-*` UI artifact (banner, balloon, menu, tooltip, spinner, gadget, attribution, iframe variants).

### Live data API

- Optional Express endpoints in `server.js`: `/api/health`, `/api/host-cities`, `/api/impact`, `/api/live-feeds`, `/api/grant-feeds`.
- `refreshLive()` hits `/api/live-feeds` and `/api/grant-feeds`. After the first failure (e.g. on static GitHub Pages with no Express backend), `liveApiAvailable` flips to false and the auto-refresh interval is cleared. **Do not re-introduce a 5-min retry on failure.**
- No "Live API unreachable" toasts. The dashboard runs cleanly on factual fallback content; never surface a status pill or banner about it.

## Common pitfalls (learned the hard way)

### GitHub web upload landing in `assets/foo**/`

The user's web uploads consistently land in folders named with literal `**` — `assets/marathon**/`, `assets/pogba**/` — because GitHub's "create new folder" field gets pre-filled by markdown bold from chat. The fix:

```bash
# Move + rename in the same operation
mv "assets/marathon**/IMG_xxxx.mov" assets/marathon/nip.mov
git rm "assets/marathon**/IMG_xxxx.mov"   # quote the literal path; do NOT shell-glob
rmdir "assets/marathon**"
```

**Critical:** never run `git rm -r assets/marathon**` unquoted — the shell will expand `**` to match `assets/marathon/` AND `assets/marathon**/`, deleting the good folder along with the broken one. Always quote the path.

### Perl mojibake when replacing characters

Use `-CSD` flag for proper UTF-8 in/out, AND use `\x{NNNN}` Unicode escapes instead of literal multi-byte characters in the perl source:

```bash
perl -i -CSD -pe '
  s/\x{2014}/, /g;        # em dash → comma
  s/\x{2013}/-/g;         # en dash → hyphen
  s/>\x{2014}</>\x{2026}</g;  # placeholder em → ellipsis
' index.html
```

If you ever see `â¦` in a grep result, that's the mojibake of `…` (U+2026). The byte sequence to look for in the file is `C3 A2 C2 80 C2 A6` (which decodes to â + U+0080 + ¦ when interpreted as UTF-8). Patch back with:

```bash
perl -i -CSD -pe 's/\x{00E2}\x{0080}\x{00A6}/\x{2026}/g' index.html
```

### Video container compatibility

iPhone-recorded `.mov` files usually contain H.264 video. Safari decodes them natively; Firefox refuses the QuickTime container; Chrome is mixed. The fix is to:

1. Duplicate `nip.mov` as `nip.mp4` (same bytes, different extension/MIME).
2. Order the `<source>` tags `.mp4` first, `.mov` second, `.webm` third.
3. Server-side MIME types are correct out of the box from `express.static`; don't override.

For full universal support, the user can transcode via HandBrake / ffmpeg later. Don't ship a "convert this for me" auto-step.

### Image upload paths

When telling the user where to upload an image, give the GitHub Web UI URLs for **both** folders:

- `https://github.com/wardere83/defiantsportsdashboard/upload/main/<folder>`
- `https://github.com/wardere83/defiantsportsdashboard/upload/main/public/<folder>`

And **always specify the exact target filename** (e.g. "rename to `nip.mp4` before committing"). The user's filenames are usually iPhone-style `IMG_xxxx`, which the code is not wired for.

## Deferred / no-ops to leave alone

- `renderTranslate`, `<section id="translate">`, `.lang-grid` / `.lang-card` CSS — left as harmless dead code so the Translate tab can be re-enabled by re-adding the views entry without rewriting anything.
- `MARATHON_DROPS`, `.drops-grid` / `.drop-tile` CSS — removed entirely with the Latest Drops card (do not re-add).
- The hidden translation engine mount point — must stay; the engine needs the node to initialise. It's already positioned off-screen via inline style; do not `display: none` it.

## Authoritative facts to use

- FIFA World Cup 2026: Jun 11 to Jul 19, 2026.
- Opening match: Estadio Azteca, Mexico City, 12:00 CDMX (Mexico City stays on UTC-6 year-round; DST abolished in 2022). UTC equivalent: 18:00.
- Final: MetLife Stadium, NY/NJ, 15:00 ET / 19:00 UTC.
- Format: 12 groups of 4 → R32 → R16 → QF → SF → 3rd-place → Final. 48 teams. 104 matches. 16 host cities across USA, Canada, Mexico.
- Semi-finals: Atlanta + Dallas. Third-place match: Miami.
- Defiant Sports site: `https://defiantsports.io`.
- The Defiant Foundation donate: `https://thedefiantfoundation.org/donate/`.
- The Marathon Clothing: `https://www.themarathonclothing.com/` (3420 W Slauson Ave, Los Angeles).
- Nipsey Hussle: Ermias Asghedom, 1985-2019.

## What success looks like at the end of any change

1. `index.html` and `public/index.html` are byte-identical (`diff` returns nothing).
2. `npm run check` passes (`node --check server.js`).
3. A quick `node server.js` followed by `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` returns `200`.
4. Commit message explains the why.
5. PR is open + merged on the user's branch with the merge SHA reported back to them.
