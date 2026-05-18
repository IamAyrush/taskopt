const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    trim: true,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  sharedWithViewOnce: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    viewed: {
      type: Boolean,
      default: false,
    }
  }],
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Create text index for full-text search
noteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', noteSchema);
