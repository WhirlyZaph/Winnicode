const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  likes: { type: Number, default: 0 },
  saves: { type: Number, default: 0 }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
