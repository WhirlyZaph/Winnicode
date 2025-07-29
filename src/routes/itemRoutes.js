const express = require('express');
const router = express.Router();
const { getItemById } = require('../controllers/itemController');
const Item = require('../models/itemModel');
const Comment = require('../models/commentModel');

// GET engagement summary per item
router.get('/summary', async (req, res) => {
  try {
    const items = await Item.find({}, 'name likes saves');

    // For each item, count associated comments
    const summary = await Promise.all(
      items.map(async (item) => {
        const commentCount = await Comment.countDocuments({ itemId: item._id });
        return {
          name: item.name,
          likes: item.likes || 0,
          saves: item.saves || 0,
          comments: commentCount
        };
      })
    );

    res.json(summary);
  } catch (err) {
    console.error('[Item Summary] Error:', err);
    res.status(500).json({ error: 'Failed to fetch item summary' });
  }
});

// GET single item (for like/save counters)
router.get('/:id', getItemById);

// POST like
router.post('/:id/like', async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  item.likes = (item.likes || 0) + 1;
  await item.save();

  res.json({ likes: item.likes });
});

// POST save
router.post('/:id/save', async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  item.saves = (item.saves || 0) + 1;
  await item.save();

  res.json({ saves: item.saves });
});

module.exports = router;
