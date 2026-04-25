# Gladiators Game-to-Website Leaderboard Architecture

## Goal
Connect the desktop game in `Gladiators` to the website in `gladiators-website` so that:

- after each battle, the game sends a battle result to the website backend
- the backend stores match history and player progression
- the website shows a real leaderboard instead of seeded demo data
- the design can later support highlights, AI analysis, and LAN duel history

This document is the starting architecture, not the final implementation.

## Current Repo Fit

### Desktop game repo
Useful existing hooks:

- `MainWindow::handleBattleFinished()` in `Gladiators/src/MainWindow.cpp`
  This is the best upload trigger because the game already knows:
  - username
  - victory/loss
  - score
  - damage dealt
  - damage taken
- `BattleWidget::levelBattleReport()` in `Gladiators/src/BattleWidget.cpp`
  This already collects a strong battle summary structure.
- `DatabaseManager` in `Gladiators/src/DatabaseManager.cpp`
  This is local persistence and local auth. It should stay local.
- Qt Network is already linked in `Gladiators/CMakeLists.txt`
  So adding a game upload client is natural.

### Website repo
Useful existing hooks:

- `server/server.js`
  Current Express backend exists already, but only serves `tasks.json`.
- `src/pages/Leaderboard.jsx`
  Current leaderboard page is seeded with local demo data.
- `src/components/LeaderboardTable.jsx`
  Already renders leaderboard rows cleanly.

This means we do not need a new stack. We should extend the current website server and replace seeded leaderboard data with backend data.

## Recommended Architecture

Use this 3-part flow:

1. Desktop game creates a `BattleResultPayload`
2. Game uploads it to the website backend with an HTTP `POST`
3. Website backend stores the match, updates player aggregates, and exposes leaderboard APIs for the React frontend

High-level shape:

```text
Gladiators (Qt/C++)
  -> POST /api/game-results
     -> gladiators-website/server (Express)
        -> SQLite database
           -> players
           -> matches
           -> weekly snapshots / derived views
  -> GET /api/leaderboard
     -> React leaderboard page
```

## Why This Shape

This architecture matches your current repos well:

- minimal change to the game
- minimal change to the website
- no need to merge repos
- backend remains simple enough for a class project
- future features can be added on top without redesign

## Storage Recommendation

Use `SQLite` first on the website backend.

Why:

- your current server is file-based, so SQLite is the smallest real upgrade
- much safer and cleaner than writing JSON manually for leaderboard data
- good enough for a demo, class project, and early deployment
- easy to migrate later to PostgreSQL if needed

Do not keep leaderboard data in `tasks.json`.

## Core Data Model

### `players`
One row per player account known to the website leaderboard service.

Suggested fields:

- `id`
- `username`
- `email` nullable for MVP
- `avatar_path`
- `favorite_character`
- `total_score`
- `high_score`
- `wins`
- `losses`
- `matches_played`
- `campaign_clears`
- `lan_wins`
- `lan_losses`
- `damage_dealt_total`
- `damage_taken_total`
- `best_battle_duration_seconds`
- `current_rank_label`
- `rating_points`
- `last_match_at`
- `created_at`
- `updated_at`

### `matches`
One row per uploaded battle result.

Suggested fields:

- `id`
- `player_id`
- `mode`
  - `save_the_king`
  - `lan_duel`
  - future: `zombie`, `exhibition`
- `character_type`
- `character_name`
- `enemy_type` nullable for LAN
- `enemy_name`
- `opponent_username` nullable
- `victory`
- `score`
- `damage_dealt`
- `damage_taken`
- `player_hp_end`
- `player_max_hp`
- `battle_duration_seconds`
- `level_index`
- `level_name`
- `campaign_complete`
- `build_version`
- `played_at`
- `source`
  - `desktop_game`

### `weekly_leaderboard_snapshots` optional later
Only add this if you want “Top Warrior of the Week” without heavy recomputation.

## Ranking Model

Do not rely only on raw score.

Recommended approach:

- store raw facts exactly as they happened
- compute leaderboard ranking from derived values

For MVP, keep it simple:

```text
ranking_points =
  total_score
  + wins * 250
  + campaign_clears * 500
  + lan_wins * 350
  - losses * 50
```

Display both:

- `score`
- `ranking_points`

That gives you flexibility later without rewriting stored history.

## API Contract

### 1. Upload a game result

`POST /api/game-results`

Purpose:

- receive one finished battle from the desktop game
- validate it
- store match history
- update the player aggregate row

Recommended request:

```json
{
  "apiKey": "game-shared-secret",
  "player": {
    "username": "moa_taz",
    "characterType": "ARCEN",
    "characterName": "Arcen"
  },
  "battle": {
    "mode": "save_the_king",
    "levelIndex": 2,
    "levelName": "Fire Wizard",
    "enemyType": "FIRE_WIZARD",
    "enemyName": "Fire Wizard",
    "victory": true,
    "score": 1840,
    "damageDealt": 88,
    "damageTaken": 12,
    "playerHpEnd": 68,
    "playerMaxHp": 80,
    "battleDurationSeconds": 21.4,
    "campaignComplete": false,
    "playedAt": "2026-04-25T18:40:00Z"
  },
  "client": {
    "gameVersion": "0.1.0",
    "platform": "windows"
  }
}
```

Recommended response:

```json
{
  "ok": true,
  "player": {
    "username": "moa_taz",
    "totalScore": 9120,
    "matchesPlayed": 7,
    "wins": 6,
    "losses": 1,
    "rankingPoints": 10870,
    "rankLabel": "Arena Elite"
  }
}
```

### 2. Fetch leaderboard

`GET /api/leaderboard?mode=global&limit=25&range=all`

Purpose:

- website leaderboard page
- later also in-game website view if you want

Recommended response:

```json
{
  "rows": [
    {
      "rank": 1,
      "username": "moa_taz",
      "characterName": "Arcen",
      "score": 9120,
      "rankingPoints": 10870,
      "wins": 6,
      "losses": 1,
      "matchesPlayed": 7,
      "lastBattleAt": "2026-04-25T18:40:00Z",
      "title": "Arena Elite"
    }
  ]
}
```

### 3. Fetch recent matches

`GET /api/matches/recent?limit=20`

Purpose:

- show recent battles on the website
- easy future page for “latest arena results”

### 4. Fetch single player profile

`GET /api/players/:username`

Purpose:

- player details page
- recent matches
- favorite character
- top stats

## Game-Side Design

Add one small integration layer in the desktop game instead of spreading upload logic everywhere.

Suggested new class:

- `WebsiteSyncClient`

Suggested files:

- `Gladiators/include/WebsiteSyncClient.h`
- `Gladiators/src/WebsiteSyncClient.cpp`

Responsibilities:

- hold backend base URL from `.env` or config
- hold shared API key
- build JSON payload from battle result
- send async HTTP request with `QNetworkAccessManager`
- log failure without interrupting gameplay

Do not put HTTP upload code directly inside `MainWindow`.

### Best upload trigger

Use `MainWindow::handleBattleFinished()`.

Why:

- central point
- final result is already known
- player username is already known
- game over flow already happens here

Suggested flow:

1. `handleBattleFinished()` computes result
2. it saves local progression through `DatabaseManager`
3. it also sends a non-blocking upload request through `WebsiteSyncClient`
4. if upload fails, local game flow still continues

This feature should never block battle completion.

## Website Backend Design

Refactor `gladiators-website/server/server.js` into small modules.

Suggested server structure:

```text
server/
  server.js
  db.js
  schema.sql
  routes/
    tasks.js
    leaderboard.js
    gameResults.js
    players.js
  services/
    leaderboardService.js
    rankingService.js
    matchService.js
  middleware/
    authenticateGameClient.js
    validateGameResult.js
```

### Responsibilities

`gameResults.js`

- `POST /api/game-results`

`leaderboard.js`

- `GET /api/leaderboard`
- `GET /api/leaderboard/weekly`

`players.js`

- `GET /api/players/:username`
- `GET /api/players/:username/matches`

`rankingService.js`

- calculate `ranking_points`
- assign title/rank label

`matchService.js`

- insert match row
- update aggregate player stats

## Frontend Website Design

Replace seeded leaderboard data in `src/pages/Leaderboard.jsx` with fetch-based data.

Suggested steps:

1. add `src/lib/api.js`
2. fetch from `/api/leaderboard`
3. map backend row shape into `LeaderboardTable`
4. keep search/filter/sort in the frontend

Do not hardcode the leaderboard in `Leaderboard.jsx` anymore once backend is ready.

### Suggested UI additions

- `Top Warrior of the Week`
- `Recent Battles`
- `Best Character Usage`
- `Latest uploaded from desktop game`

These can come after the MVP.

## Authentication Between Game and Website

For MVP, use a shared backend secret:

- store `GAME_UPLOAD_API_KEY` on the website server
- store `GLADIATORS_WEB_API_KEY` in the desktop game `.env`
- send it in header or body

Recommended header:

- `X-Gladiators-Api-Key`

This is enough for a class demo and local deployment.

Later, if needed:

- signed requests
- real user session sync
- OAuth or token-based account linking

But do not start there.

## Failure Handling

The upload flow should be fire-and-forget from the game’s perspective.

If upload fails:

- log it locally
- maybe keep a small retry queue later
- never block `Game Over`
- never show a scary error to the player

Optional later improvement:

- store pending uploads locally in a tiny queue file
- retry next time the game launches

## Recommended MVP

Build the feature in this order:

1. Website backend:
   - add SQLite
   - add `POST /api/game-results`
   - add `GET /api/leaderboard`

2. Website frontend:
   - replace seeded leaderboard with fetched backend data

3. Desktop game:
   - add `WebsiteSyncClient`
   - upload battle result from `handleBattleFinished()`

4. Polish:
   - recent battles page
   - weekly champion
   - player detail page

## Shared Battle Result Contract

The game should send raw facts, not precomputed website-only values.

Good fields to send:

- username
- character type
- character display name
- mode
- enemy type
- enemy name
- victory
- score
- damage dealt
- damage taken
- end HP
- battle duration
- level index
- campaign complete
- played timestamp

The website should compute:

- leaderboard rank
- title
- weekly champion
- ranking points
- best streaks

This keeps game and website responsibilities clean.

## Future Extensions

This architecture also supports your later ideas:

### Highlight upload

Add:

- `POST /api/highlights`
- `match_id`
- screenshot image path
- AI analysis text

### AI move analysis

Add:

- `match_events` table
- upload structured move events
- website requests AI summary from backend

### LAN duel history

Already supported by `mode = lan_duel`

Add:

- `opponent_username`
- duel win/loss
- duel-specific leaderboard tab

## Recommended Next Coding Step

The best first implementation step is:

1. extend `gladiators-website/server/server.js` into a real leaderboard API
2. use SQLite
3. keep the React leaderboard page intact visually
4. then add the Qt upload client

That path gives you visible progress quickly and keeps the architecture simple.
