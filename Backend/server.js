require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const thinkSpeakRoutes = require('./routes/thinkSpeakRoutes');
const userRoutes = require('./routes/userRoute');

const app = express();

// ✅ Connect MongoDB
connectDB();

// ✅ CORS configuration
const corsOptions = {
  origin: [
    'https://stressnet-1.netlify.app', // deployed frontend
    'http://localhost:5173',           // local frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Handle preflight requests for all routes safely
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  next();
});

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/thinkSpeak', thinkSpeakRoutes);
app.use('/api/users', userRoutes);

// ✅ Health route for Render uptime check
app.get('/', (req, res) => {
  res.status(200).send('🌐 StressNet Backend is running successfully!');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
