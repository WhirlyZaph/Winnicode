const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: String,
  comment: String,
}, {
  timestamps: true // adds createdAt & updatedAt
});

module.exports = mongoose.model('Comment', commentSchema);