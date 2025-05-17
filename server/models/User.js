const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['admin', 'superAdmin', 'instructor', 'student'], default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

