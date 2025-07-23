const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['admin', 'superAdmin', 'mentor', 'student'], default: 'student' },
  refreshTokens: [{
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    userAgent: String,
    lastUsed: Date
  }]
}, { timestamps: true });

// Method to add a refresh token
userSchema.methods.addRefreshToken = async function (token, expiresIn, userAgent) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // Limit the number of active refresh tokens per user
  const MAX_REFRESH_TOKENS = 5;
  if (this.refreshTokens.length >= MAX_REFRESH_TOKENS) {
    // Remove the oldest token
    this.refreshTokens.shift();
  }

  this.refreshTokens.push({
    token,
    expiresAt,
    userAgent,
    lastUsed: new Date()
  });

  await this.save();
};

// Method to remove a refresh token
userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  await this.save();
};

// Method to remove all refresh tokens
userSchema.methods.removeAllRefreshTokens = async function () {
  this.refreshTokens = [];
  await this.save();
};

// Method to validate a refresh token
userSchema.methods.validateRefreshToken = async function (token) {
  const tokenDoc = this.refreshTokens.find(rt => rt.token === token);
  if (!tokenDoc) return false;

  // Check if token has expired
  if (tokenDoc.expiresAt < new Date()) {
    this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
    await this.save();
    return false;
  }

  // Update last used timestamp
  tokenDoc.lastUsed = new Date();
  await this.save();
  return true;
};

// Cleanup expired tokens before saving
userSchema.pre('save', function (next) {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > now);
  next();
});

module.exports = mongoose.model('User', userSchema);

