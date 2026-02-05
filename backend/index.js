require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const tripRoutes = require('./routes/tripRoutes');
const aiRoutes = require('./routes/aiRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const agentRoutes = require('./routes/agentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const eventRoutes = require('./routes/eventRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const port = process.env.PORT || 3001;

// Connect to Database
connectDB();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any localhost (development)
    if (origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    
    // Allow explicit FRONTEND_URL if set
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    // Allow Vercel deployments (preview and production)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Default: allow if matches FRONTEND_URL, otherwise deny
    // BUT for debugging, let's log the blocked origin
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;
