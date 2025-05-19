const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  filename: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Photo', photoSchema);
