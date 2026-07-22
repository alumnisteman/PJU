/**
 * Smart PJU System — Static File Server
 * Serves all frontend modules from the project root.
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve all static files from project root
app.use(express.static(path.join(__dirname), {
  setHeaders(res, filePath) {
    // Disable caching during development
    res.setHeader('Cache-Control', 'no-store');
  }
}));

// Fallback: any unknown route → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PJU Smart System running at http://0.0.0.0:${PORT}`);
});
