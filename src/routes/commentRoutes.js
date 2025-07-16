const express = require('express');
const router = express.Router();
const Comment = require('../models/commentModel');
const mongoose = require('mongoose');

// GET comments for specific item (place this first!)
router.get('/:itemId', async (req, res) => {
  console.log('Fetching comments for item:', req.params.itemId);
  try {
    const comments = await Comment.find({ itemId: req.params.itemId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// POST comment
router.post('/', async (req, res) => {
  try {
    const { name, comment, itemId } = req.body;
	console.log('[COMMENT POST]', { name, comment, itemId });

    // Validate required fields
    if (!name || !comment || !itemId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate itemId is an ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId' });
    }

    const newComment = new Comment({ name, comment, itemId });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Failed to save comment:', err);
    res.status(500).json({ error: 'Failed to save comment' });
  }
});

module.exports = router;
