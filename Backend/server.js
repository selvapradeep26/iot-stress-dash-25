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
app.use(
  cors({
    origin: [
      'https://stressnet-1.netlify.app', // your deployed frontend
      'http://localhost:5173',           // local dev
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ✅ Handle preflight requests (important for Render)
app.options('*', cors());

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/thinkSpeak', thinkSpeakRoutes);
app.use('/api/users', userRoutes);

// ✅ Health check route for Render
app.get('/', (req, res) => {
  res.status(200).send('🌐 StressNet Backend is running successfully!');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
