const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const {
  databasePath,
  getDatabaseStats,
  getLeaderboard,
  getPlayerProfile,
  getRecentMatches,
  upsertPlayerAndMatch
} = require('./db');

const app = express();
const port = Number.parseInt(process.env.PORT || '3001', 10);
const tasksFilePath = path.join(__dirname, 'tasks.json');
const configuredApiKey = String(process.env.GAME_UPLOAD_API_KEY || '').trim();

app.use(cors());
app.use(express.json());

function requireGameApiKey(req, res, next) {
  if (!configuredApiKey) {
    next();
    return;
  }

  const incoming = String(req.get('X-Gladiators-Api-Key') || req.body?.apiKey || '').trim();
  if (!incoming || incoming !== configuredApiKey) {
    res.status(401).json({ ok: false, message: 'Invalid game upload API key.' });
    return;
  }

  next();
}

function readTasksFile() {
  const raw = fs.readFileSync(tasksFilePath, 'utf8');
  return JSON.parse(raw);
}

function writeTasksFile(nextTasks) {
  fs.writeFileSync(tasksFilePath, JSON.stringify(nextTasks, null, 2));
}

app.get('/api/health', async (req, res) => {
  try {
    res.json({
      ok: true,
      service: 'gladiators-backend',
      database: await getDatabaseStats(),
      uploadApiKeyEnabled: Boolean(configuredApiKey)
    });
  } catch (error) {
    console.error('Failed to read health stats:', error);
    res.status(500).json({ ok: false, message: 'Failed to read backend health.' });
  }
});

app.get('/api/tasks', (req, res) => {
  try {
    res.json(readTasksFile());
  } catch (error) {
    console.error('Error reading tasks file:', error);
    res.status(500).json({ ok: false, message: 'Failed to read tasks.' });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    writeTasksFile(req.body);
    res.json({ ok: true, message: 'Tasks updated successfully.' });
  } catch (error) {
    console.error('Error writing tasks file:', error);
    res.status(500).json({ ok: false, message: 'Failed to save tasks.' });
  }
});

app.post('/api/game-results', requireGameApiKey, async (req, res) => {
  try {
    const playerSummary = await upsertPlayerAndMatch(req.body);
    res.status(201).json({
      ok: true,
      player: playerSummary
    });
  } catch (error) {
    console.error('Failed to store game result:', error);
    res.status(400).json({
      ok: false,
      message: error.message || 'Failed to store game result.'
    });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const rows = await getLeaderboard({
      limit: req.query.limit,
      mode: req.query.mode,
      range: req.query.range
    });

    res.json({
      ok: true,
      rows
    });
  } catch (error) {
    console.error('Failed to read leaderboard:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to read leaderboard.'
    });
  }
});

app.get('/api/matches/recent', async (req, res) => {
  try {
    const rows = await getRecentMatches(req.query.limit);
    res.json({
      ok: true,
      rows
    });
  } catch (error) {
    console.error('Failed to read recent matches:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to read recent matches.'
    });
  }
});

app.get('/api/players/:username', async (req, res) => {
  try {
    const profile = await getPlayerProfile(req.params.username);
    if (!profile) {
      res.status(404).json({
        ok: false,
        message: 'Player not found.'
      });
      return;
    }

    res.json({
      ok: true,
      player: profile
    });
  } catch (error) {
    console.error('Failed to read player profile:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to read player profile.'
    });
  }
});

app.listen(port, () => {
  console.log(`Gladiators backend listening at http://localhost:${port}`);
  console.log(`SQLite database: ${databasePath}`);
});
