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

app.use(cors());
app.use(express.json());

// Existing routes
app.use('/api/auth', authRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/thinkSpeak', thinkSpeakRoutes);

// ✅ New User route
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
