const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Simulate the Vercel serverless function for /api/words
app.get('/api/words', (req, res) => {
  const wordsPath = path.join(__dirname, 'api/words.json');
  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
  res.json(words);
});

// Serve the index.html file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
