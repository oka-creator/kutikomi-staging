const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const { generateReview } = require('./utils/openai');

// 環境に応じた.envファイルを読み込む
dotenv.config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'development'}`)
});

const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/survey', async (req, res) => {
  try {
    const { responses } = req.body;
    
    // Save survey responses to database
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO survey_responses(responses) VALUES($1) RETURNING id',
      [JSON.stringify(responses)]
    );
    const surveyId = result.rows[0].id;
    client.release();

    // Generate review
    const review = await generateReview(responses);

    res.json({ surveyId, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the survey' });
  }
});

app.listen(port, () => {
    console.log(`API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
  });

module.exports = app;