const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// GET all items (optional, used for full list rendering)
router.get('/', async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 });
  res.json(items);
});

// GET single item (for like/save counters)
router.get('/:id', async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

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
