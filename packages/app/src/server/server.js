const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow requests from Backstage
app.use(express.json());

const scores = {
  "user-service": { "security": 90, "documentation": 80, "reliability": 70 },
  "order-service": { "security": 75, "documentation": 85, "reliability": 80 },
  "payment-service": { "security": 85, "documentation": 78, "reliability": 88 }
};

// API Endpoint to Get Scores
app.get('/scorecard', (req, res) => {
  res.json(scores);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Scorecard API running on http://localhost:${PORT}`);
});
