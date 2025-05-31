"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const oauth_controller_1 = require("../controllers/oauth.controller");
const router = express_1.default.Router();
const oauthController = new oauth_controller_1.OAuthController();
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
}));
router.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: "/login",
    session: false,
}), oauthController.googleAuthCallback);
router.get("/tokens", oauthController.getOAuthTokens);
exports.default = router;
//# sourceMappingURL=oauth.route.js.map