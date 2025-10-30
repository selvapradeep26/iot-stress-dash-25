require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const thinkSpeakRoutes = require('./routes/thinkSpeakRoutes');
const userRoutes = require('./routes/userRoute'); // ✅ Correct path

const app = express();
connectDB();

// ✅ Updated CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:5173', // for local development
      'https://stressnet-1.netlify.app', // your deployed frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/thinkSpeak', thinkSpeakRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
