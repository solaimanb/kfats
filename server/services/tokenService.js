const jwt = require('jsonwebtoken');
const { createError } = require('../utils/errorHandler');
const config = require('../config');

class TokenService {
    constructor() {
        this.accessTokenSecret = config.jwt.accessToken.secret;
        this.refreshTokenSecret = config.jwt.refreshToken.secret;
        this.accessTokenExpiry = config.jwt.accessToken.expiresIn;
        this.refreshTokenExpiry = config.jwt.refreshToken.expiresIn;
    }

    generateAccessToken(userId) {
        return jwt.sign({ id: userId }, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiry
        });
    }

    generateRefreshToken(userId) {
        return jwt.sign({ id: userId }, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiry
        });
    }

    async generateTokenPair(userId) {
        const accessToken = this.generateAccessToken(userId);
        const refreshToken = this.generateRefreshToken(userId);

        return {
            accessToken,
            refreshToken,
            expiresIn: this.parseExpiry(this.accessTokenExpiry)
        };
    }

    async verifyAccessToken(token) {
        try {
            return jwt.verify(token, this.accessTokenSecret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw createError(401, 'Access token has expired');
            }
            throw createError(401, 'Invalid access token');
        }
    }

    async verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.refreshTokenSecret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw createError(401, 'Refresh token has expired');
            }
            throw createError(401, 'Invalid refresh token');
        }
    }

    parseExpiry(expiryString) {
        const unit = expiryString.slice(-1);
        const value = parseInt(expiryString);

        switch (unit) {
            case 'm': return value * 60;
            case 'h': return value * 60 * 60;
            case 'd': return value * 24 * 60 * 60;
            default: return 900; // 15 minutes default
        }
    }
}

module.exports = new TokenService(); 