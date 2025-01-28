const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const wordsPath = path.join(__dirname, '../words.json'); // Poprawna ścieżka do words.json
  try {
    const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się załadować słówek' });
  }
};
