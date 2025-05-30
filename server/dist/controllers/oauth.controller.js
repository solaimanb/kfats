"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthController = void 0;
const catch_async_util_1 = require("../utils/catch-async.util");
class OAuthController {
    constructor() {
        this.googleAuthCallback = (0, catch_async_util_1.catchAsync)(async (_req, res) => {
            res.redirect(process.env.CLIENT_URL || "/");
        });
        this.getOAuthTokens = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            res.status(200).json({
                status: "success",
                data: req.user,
            });
        });
    }
}
exports.OAuthController = OAuthController;
//# sourceMappingURL=oauth.controller.js.map