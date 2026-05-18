const express = require('express');
const Note = require('../models/Note');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /notes - Get all notes for authenticated user
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { userId: req.userId },
        { sharedWith: req.userId },
        { 'sharedWithViewOnce.userId': req.userId }
      ]
    }).sort({ created_at: -1 });
    
    // Filter out view-once notes that have already been viewed by current user
    const filteredNotes = notes.filter(note => {
      const viewOnceShare = note.sharedWithViewOnce.find(
        v => v.userId.toString() === req.userId
      );
      // If it's a view-once share and already viewed, exclude it
      if (viewOnceShare && viewOnceShare.viewed) {
        return false;
      }
      return true;
    });
    
    res.json(filteredNotes);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch notes' });
  }
});

// GET /search - Full-text search for notes
router.get('/search/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;
    
    if (!keyword || keyword.trim().length === 0) {
      return res.status(400).json({ error: 'Search keyword is required' });
    }

    const notes = await Note.find(
      {
        $text: { $search: keyword },
        $or: [
          { userId: req.userId },
          { sharedWith: req.userId },
          { 'sharedWithViewOnce.userId': req.userId }
        ]
      },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    // Filter out view-once notes that have already been viewed by current user
    const filteredNotes = notes.filter(note => {
      const viewOnceShare = note.sharedWithViewOnce.find(
        v => v.userId.toString() === req.userId
      );
      // If it's a view-once share and already viewed, exclude it
      if (viewOnceShare && viewOnceShare.viewed) {
        return false;
      }
      return true;
    });

    res.json(filteredNotes);
  } catch (error) {
    res.status(500).json({ error: 'Unable to search notes' });
  }
});

// GET /notes/:id - Get specific note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if user owns the note or it's shared with them
    const isOwner = note.userId.toString() === req.userId;
    const isSharedRegular = note.sharedWith.includes(req.userId);
    const viewOnceShare = note.sharedWithViewOnce.find(
      v => v.userId.toString() === req.userId
    );

    if (!isOwner && !isSharedRegular && !viewOnceShare) {
      return res.status(403).json({ error: 'Not authorized to access this note' });
    }

    // If this is a view-once note, mark it as viewed
    if (viewOnceShare && !viewOnceShare.viewed) {
      viewOnceShare.viewed = true;
      if (!note.viewedBy.includes(req.userId)) {
        note.viewedBy.push(req.userId);
      }
      await note.save();
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch note' });
  }
});

// POST /notes - Create new note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const note = new Note({
      title,
      content: content || '',
      userId: req.userId,
      sharedWith: [],
      sharedWithViewOnce: [],
      viewedBy: []
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create note' });
  }
});

// PUT /notes/:id - Update note
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Only owner can update
    if (note.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this note' });
    }

    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Unable to update note' });
  }
});

// DELETE /notes/:id - Delete note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Only owner can delete
    if (note.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this note' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete note' });
  }
});

// POST /notes/:id/share - Share note with another user
router.post('/:id/share', async (req, res) => {
  try {
    const { share_with_email, viewOnce } = req.body;

    if (!share_with_email) {
      return res.status(400).json({ error: 'share_with_email is required' });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Only owner can share
    if (note.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to share this note' });
    }

    const shareWithUser = await User.findOne({ email: share_with_email });

    if (!shareWithUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Handle view-once sharing
    if (viewOnce) {
      const existingViewOnce = note.sharedWithViewOnce.find(
        v => v.userId.toString() === shareWithUser._id.toString()
      );
      if (existingViewOnce) {
        return res.status(400).json({ error: 'Note already shared with this user in view-once mode' });
      }
      note.sharedWithViewOnce.push({
        userId: shareWithUser._id,
        viewed: false
      });
    } else {
      // Handle regular sharing
      if (note.sharedWith.includes(shareWithUser._id)) {
        return res.status(400).json({ error: 'Note already shared with this user' });
      }
      note.sharedWith.push(shareWithUser._id);
    }

    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Unable to share note' });
  }
});

module.exports = router;
