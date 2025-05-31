import { Schema, model, Document } from "mongoose";

export interface IRefreshToken extends Document {
  user: Schema.Types.ObjectId;
  token: string;
  expiresAt: Date;
  issuedAt: Date;
  isRevoked: boolean;
  deviceInfo: {
    ip: string;
    userAgent: string;
    deviceId?: string;
  };
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    issuedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    deviceInfo: {
      ip: String,
      userAgent: String,
      deviceId: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast token lookups (with unique constraint)
refreshTokenSchema.index({ token: 1 }, { unique: true });

// Index for cleaning up expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for user's tokens
refreshTokenSchema.index({ user: 1, isRevoked: 1 });

export const RefreshTokenModel = model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
