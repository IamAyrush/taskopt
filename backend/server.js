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
app.use(cors());
app.use(express.json());

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
