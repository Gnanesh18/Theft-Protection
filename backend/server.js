const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Local Uploads Static Files
const uploadsPath = process.env.VERCEL 
  ? '/tmp' 
  : path.join(__dirname, 'public/uploads');

app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/users', require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));

// Base Route
app.get('/', (req, res) => {
  const dbManager = require('./services/dbManager');
  res.json({
    message: 'Welcome to Theft Protection: An Intelligent Reporting System API',
    status: 'online',
    database: dbManager.getMongoStatus() ? 'MongoDB Atlas' : 'Local JSON File DB'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error occurred'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5001; // default to 5001 to match env
  app.listen(PORT, () => {
    console.log(`===========================================================`);
    console.log(`THEFT PROTECTION COMMAND API RUNNING ON PORT: ${PORT}`);
    console.log(`Local uploads served at http://localhost:${PORT}/uploads/`);
    console.log(`===========================================================`);
  });
}

module.exports = app;
