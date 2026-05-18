const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch tasks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = new Task({ title, description, userId: req.userId });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create task' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Unable to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete task' });
  }
});

module.exports = router;
