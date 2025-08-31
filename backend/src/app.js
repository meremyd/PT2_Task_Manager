const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

// Test Route
app.get('/', (req, res) => {
  res.send('Backend running succesfully');
});

// API Routes
app.use('/api', taskRoutes);

module.exports = app;
