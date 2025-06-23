const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const routes = require('./routes/MainRoutes');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Configure CORS
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use('/', routes);
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log('Available on:');
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://192.168.43.31:${PORT}`);
});

module.exports = app;
