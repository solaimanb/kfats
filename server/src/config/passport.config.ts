import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { config } from "./index";
import { UserModel } from "../models/user.model";
import { UserStatus } from "./rbac/types";
import { AuthUser, JWTPayload } from "../types/auth.types";
import { AuthenticationError } from "../utils/error.util";
import { Request } from "express";
import { VerifyCallback } from "passport-oauth2";

// Extend Express User type to match our AuthUser
declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

// Common error handler for passport strategies
const handlePassportError = (error: unknown, done: VerifyCallback) => {
  console.error("Passport strategy error:", error);
  if (error instanceof AuthenticationError) {
    return done(error, false);
  }
  return done(new AuthenticationError("Authentication failed"), false);
};

// Common user processor for passport strategies
const processUser = async (user: AuthUser | null, done: VerifyCallback) => {
  if (!user) {
    return done(new AuthenticationError("User not found"), false);
  }

  if (user.status !== UserStatus.ACTIVE) {
    return done(new AuthenticationError("Account is not active"), false);
  }

  return done(null, user);
};

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req.cookies.accessToken || null,
      ]),
      secretOrKey: config.jwt.secret,
      passReqToCallback: true,
    },
    async (req: Request, payload: any, done: VerifyCallback) => {
      try {
        const user = await UserModel.findById(payload.id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// Google OAuth Strategy
if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
        passReqToCallback: true,
      },
      async (_req: Request, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {
        try {
          // Check if user exists
          let user = await UserModel.findOne({ email: profile.emails[0].value });

          if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          user = await UserModel.create({
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            googleId: profile.id,
            isEmailVerified: true,
            avatar: profile.photos[0]?.value,
          });

          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
} else {
  console.log("Google OAuth is disabled - missing client ID or secret");
}

// Serialization
passport.serializeUser((user: any, done: VerifyCallback) => {
  done(null, user.id);
});

// Deserialization
passport.deserializeUser(async (id: string, done: VerifyCallback) => {
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
});
