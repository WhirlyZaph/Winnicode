const express = require('express');
const router = express.Router();
const Comment = require('../models/commentModel');
const Item = require('../models/itemModel');
const mongoose = require('mongoose');

// Get comment summary per item
router.get('/summary', async (req, res) => {
  try {
    const summary = await Comment.aggregate([
      {
        $group: {
          _id: "$itemId",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "items", // match MongoDB collection name exactly
          localField: "_id",
          foreignField: "_id",
          as: "itemInfo"
        }
      },
      {
        $unwind: {
          path: "$itemInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          name: { $ifNull: ["$itemInfo.name", "Unknown"] },
          count: 1
        }
      }
    ]);

    res.json(summary.map(s => ({
      name: s.name,
      commentCount: s.count
    })));
  } catch (err) {
    console.error("[/summary] Aggregation failed:", err);
    res.status(500).json({ message: err.message });
  }
});

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
const axios = require('axios');
router.post('/', async (req, res) => {
  try {
    const sanitize = str => str.replace(/[<>]/g, '');
    const name = sanitize(req.body.name);
    const comment = sanitize(req.body.comment);
    const itemId = req.body.itemId;
    const captchaToken = req.body.captcha;

    console.log('[COMMENT POST]', { name, comment, itemId });

    if (!name || !comment || !itemId || !captchaToken) {
      return res.status(400).json({ error: 'Missing required fields or captcha' });
    }

    // Validate itemId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId' });
    }

    // ✅ Verify reCAPTCHA with Google
    const secretKey = process.env.RECAPTCHA_SECRET;
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    const captchaResponse = await axios.post(verifyURL);

    if (!captchaResponse.data.success) {
      return res.status(403).json({ error: 'Failed CAPTCHA verification' });
    }

    // ✅ Save comment
    const newComment = new Comment({ name, comment, itemId });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Failed to save comment:', err);
    res.status(500).json({ error: 'Failed to save comment' });
  }
});

// DELETE comment by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Failed to delete comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
