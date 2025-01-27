const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/words', (req, res) => {
  const words = JSON.parse(fs.readFileSync(path.join(__dirname, 'words.json'), 'utf8'));
  res.json(words);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
