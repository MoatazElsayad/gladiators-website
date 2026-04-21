const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

const tasksFilePath = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());

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
