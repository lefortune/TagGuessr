const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors()); // Allow requests from any origin (safe for development)

// Route to fetch Danbooru tag info
app.get('/api/tag/:name', async (req, res) => {
    const rawName = req.params.name;
    const tagName = rawName.replace(/ /g, '_');
    try {
      const response = await fetch(`https://danbooru.donmai.us/tags.json?search[name]=${tagName}`);
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch tag info' });
    }
  });

app.get('/api/autofill', async (req, res) => {
    const search = req.query.q;
    if (!search) return res.status(400).json({ error: 'Missing search term' });
  
    const sanitized = search.toLowerCase().replace(/[^a-z0-9_]/g, '');
    try {
      const response = await fetch(`https://danbooru.donmai.us/tags.json?search[name_matches]=*${sanitized}*`);
      const data = await response.json();
  
      // Return top 10 suggestions, sorted by post count
      const suggestions = data
        .sort((a, b) => b.post_count - a.post_count)
        .slice(0, 10)
        .map(tag => ({
          name: tag.name,
          postCount: tag.post_count,
          category: tag.category,
        }));
  
      res.json(suggestions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch autofill suggestions' });
    }
  });

  app.get('/api/tag-autocomplete', async (req, res) => {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: 'Missing query' });
  
    try {
      const response = await fetch(
        `https://danbooru.donmai.us/tags.json?search[name_matches]=*${encodeURIComponent(query)}*&limit=10`
      );
      const tags = await response.json();
      res.json(tags);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running at http://localhost:${PORT}`);
});
