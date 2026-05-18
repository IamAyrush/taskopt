const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const notesRoute = require('./routes/notes');
const authRoute = require('./routes/auth');
const tasksRoute = require('./routes/tasks');
const openAPISpec = require('./openapi.json');
const authMiddleware = require('./middleware/auth');
const User = require('./models/User');

dotenv.config();

connectDB();

const app = express();

// CORS configuration to allow Vercel frontend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://taskopt.vercel.app', // Replace with your actual Vercel frontend URL
    process.env.FRONTEND_URL // Optional: add from environment
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is healthy' });
});

app.use('/api/auth', authRoute);
app.use('/api/notes', notesRoute);
app.use('/api/tasks', tasksRoute);

// OpenAPI documentation
app.get('/openapi.json', (req, res) => {
  res.json(openAPISpec);
});

// About endpoint - returns authenticated user details
app.get('/about', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch user details' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Task Note App backend is running.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
