import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  VerifiedCallback,
} from "passport-jwt";
import { config } from "./index";
import { UserModel, IUser } from "../models/user.model";
import { UserStatus } from "./rbac.config";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.secret,
    },
    async (payload: { id: string }, done: VerifiedCallback) => {
      try {
        const user = await UserModel.findById(payload.id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user as unknown as Express.User);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy (only if credentials are provided)
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
        done
      ) => {
        try {
          // Check if user already exists
          let user = await UserModel.findOne({
            email: profile.emails?.[0].value,
          });

          if (user) {
            // Update user's Google-specific information
            user.googleId = profile.id;
            if (profile.photos?.[0]?.value) {
              user.profile.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user as unknown as Express.User);
          }

          // Create new user if doesn't exist
          user = await UserModel.create({
            email: profile.emails?.[0].value,
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

          return done(null, user as unknown as Express.User);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
} else {
  console.log("Google OAuth is disabled - missing client ID or secret");
}

// Serialization
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// Deserialization
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user as unknown as Express.User);
  } catch (error) {
    done(error, null);
  }
});
