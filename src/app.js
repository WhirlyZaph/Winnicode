const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');
const commentRoutes = require('./routes/commentRoutes');
const path = require('path');

const app = express(); // <-- Define 'app' first

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/comments', commentRoutes);

// Catch-all 404 for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve static files (HTML, etc.)
app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});