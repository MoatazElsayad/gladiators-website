const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const {
  authenticateWebsiteAccount,
  getAuthPlayerById,
  registerWebsiteAccount
} = require('./db');

const app = express();
const port = 3001;

const tasksFilePath = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());

const tokenTtlSeconds = 60 * 60 * 24 * 14;

function authSecret() {
  return process.env.AUTH_SESSION_SECRET || process.env.GAME_UPLOAD_API_KEY || 'gladiators_local_auth_secret';
}

function sign(value) {
  return crypto.createHmac('sha256', authSecret()).update(value).digest('base64url');
}

function createSessionToken(player) {
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({
    sub: player.id,
    username: player.username,
    iat: now,
    exp: now + tokenTtlSeconds
  })).toString('base64url');
  return `${body}.${sign(body)}`;
}

function verifySessionToken(token) {
  const [body, signature] = String(token || '').split('.');
  if (!body || !signature || signature !== sign(body)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

function bearerTokenFromRequest(req) {
  const header = String(req.headers.authorization || '').trim();
  if (!header.toLowerCase().startsWith('bearer ')) {
    return '';
  }
  return header.slice(7).trim();
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const player = await registerWebsiteAccount(req.body || {});
    res.status(201).json({
      ok: true,
      player,
      token: createSessionToken(player)
    });
  } catch (error) {
    const statusCode =
      error.message.includes('required') ||
      error.message.includes('registered') ||
      error.message.includes('characters') ||
      error.message.includes('Password')
        ? 400
        : 500;
    res.status(statusCode).json({ ok: false, message: error.message || 'Failed to register account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const player = await authenticateWebsiteAccount(req.body || {});
    res.json({
      ok: true,
      player,
      token: createSessionToken(player)
    });
  } catch (error) {
    res.status(401).json({ ok: false, message: error.message || 'Failed to login.' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const session = verifySessionToken(bearerTokenFromRequest(req));
    if (!session) {
      return res.status(401).json({ ok: false, message: 'Login required.' });
    }

    const player = await getAuthPlayerById(session.sub);
    if (!player) {
      return res.status(401).json({ ok: false, message: 'Login required.' });
    }

    res.json({ ok: true, player });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to read account.' });
  }
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  fs.readFile(tasksFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading tasks file:', err);
      return res.status(500).json({ message: 'Failed to read tasks' });
    }
    res.json(JSON.parse(data));
  });
});

// Update all tasks
app.post('/api/tasks', (req, res) => {
  const newTasks = req.body;
  fs.writeFile(tasksFilePath, JSON.stringify(newTasks, null, 2), (err) => {
    if (err) {
      console.error('Error writing tasks file:', err);
      return res.status(500).json({ message: 'Failed to save tasks' });
    }
    res.json({ message: 'Tasks updated successfully' });
  });
});

app.listen(port, () => {
  console.log(`Task server listening at http://localhost:${port}`);
});
