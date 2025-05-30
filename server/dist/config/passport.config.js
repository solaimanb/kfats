"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_jwt_1 = require("passport-jwt");
const index_1 = require("./index");
const user_model_1 = require("../models/user.model");
const rbac_config_1 = require("./rbac.config");
passport_1.default.use(new passport_jwt_1.Strategy({
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: index_1.config.jwt.secret,
}, async (payload, done) => {
    try {
        const user = await user_model_1.UserModel.findById(payload.id);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
}));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: index_1.config.google.clientId,
    clientSecret: index_1.config.google.clientSecret,
    callbackURL: index_1.config.google.callbackUrl,
    passReqToCallback: true,
}, async (_req, _accessToken, _refreshToken, profile, done) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        let user = await user_model_1.UserModel.findOne({
            email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value,
        });
        if (user) {
            user.googleId = profile.id;
            if ((_c = (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.value) {
                user.profile.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
        }
        user = await user_model_1.UserModel.create({
            email: (_d = profile.emails) === null || _d === void 0 ? void 0 : _d[0].value,
            profile: {
                firstName: ((_e = profile.name) === null || _e === void 0 ? void 0 : _e.givenName) || "",
                lastName: ((_f = profile.name) === null || _f === void 0 ? void 0 : _f.familyName) || "",
                avatar: (_h = (_g = profile.photos) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.value,
            },
            googleId: profile.id,
            emailVerified: true,
            status: rbac_config_1.UserStatus.ACTIVE,
            roles: ["student"],
            preferences: {
                language: "en",
                timezone: "UTC",
                emailNotifications: true,
                pushNotifications: true,
                theme: "light",
            },
        });
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id.toString());
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await user_model_1.UserModel.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
//# sourceMappingURL=passport.config.js.map