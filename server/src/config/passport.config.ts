import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { config } from "./index";
import { UserModel } from "../models/user.model";
import { UserStatus } from "./rbac/types";
import { AuthUser, JWTPayload } from "../types/auth.types";
import { AuthenticationError } from "../utils/error.util";

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
        (req) => req.cookies?.accessToken || null,
      ]),
      secretOrKey: config.jwt.secret,
    },
    async (payload: JWTPayload, done: VerifyCallback) => {
      try {
        const user = await UserModel.findById(payload.id).select("+security");

        if (user?.security.passwordChangedAt && payload.iat) {
          const changedTimestamp =
            user.security.passwordChangedAt.getTime() / 1000;
          if (payload.iat < changedTimestamp) {
            return done(
              new AuthenticationError(
                "Password recently changed, please log in again"
              ),
              false
            );
          }
        }

        return processUser(user, done);
      } catch (error) {
        return handlePassportError(error, done);
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
      async (
        _req,
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        try {
          const email = profile.emails?.[0].value;
          if (!email) {
            return done(
              new AuthenticationError("No email provided from Google"),
              false
            );
          }

          // Check if user already exists
          let user = await UserModel.findOne({ email });

          if (user) {
            // Update user's Google-specific information
            user.googleId = profile.id;
            if (profile.photos?.[0]?.value) {
              user.profile.avatar = profile.photos[0].value;
            }
            await user.save();
            return processUser(user, done);
          }

          // Create new user
          user = await UserModel.create({
            email,
            profile: {
              firstName: profile.name?.givenName || "",
              lastName: profile.name?.familyName || "",
              avatar: profile.photos?.[0]?.value,
            },
            googleId: profile.id,
            emailVerified: true,
            status: UserStatus.ACTIVE,
            roles: ["student"],
            preferences: {
              language: "en",
              timezone: "UTC",
              emailNotifications: true,
              pushNotifications: true,
              theme: "light",
            },
          });

          return processUser(user, done);
        } catch (error) {
          return handlePassportError(error, done);
        }
      }
    )
  );
} else {
  console.log("Google OAuth is disabled - missing client ID or secret");
}

// Serialization
passport.serializeUser((user: AuthUser, done) => {
  done(null, user._id);
});

// Deserialization
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    return processUser(user, done);
  } catch (error) {
    return handlePassportError(error, done);
  }
});
