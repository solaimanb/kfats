const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createError } = require("../utils/errorHandler");

class AuthService {
  static async generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  }

  static async verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw createError(401, "Invalid or expired token");
    }
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

module.exports = AuthService;
