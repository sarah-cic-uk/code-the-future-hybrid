require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sendEmail = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'https://code-the-future-hybrid.web.app',
  methods: ['GET', 'POST']
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Email endpoint
app.post('/send-email', async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || !text || !html) {
    return res.status(400).json({ message: 'Missing required email fields' });
  }

  try {
    const result = await sendEmail(to, subject, text, html);
    if (result.success) {
      console.log('Email sent successfully:', result.info);
      res.status(200).json({ message: 'Email sent successfully', info: result.info });
    } else {
      console.error('Failed to send email:', result.error);
      res.status(500).json({ message: 'Failed to send email', error: result.error });
    }
  } catch (error) {
    console.error('Unhandled server error:', error);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});