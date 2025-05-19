const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String // For production, hash this!
});

module.exports = mongoose.model('User', userSchema);
