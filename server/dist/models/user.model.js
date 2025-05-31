"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const rbac_config_1 = require("../config/rbac.config");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (email) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: "Invalid email format",
        },
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: [8, "Password must be at least 8 characters"],
        select: false,
    },
    roles: {
        type: [String],
        enum: Object.values(rbac_config_1.UserRole),
        default: [rbac_config_1.UserRole.STUDENT],
        validate: [
            {
                validator: function (roles) {
                    return (roles.length > 0 &&
                        roles.every((role) => Object.values(rbac_config_1.UserRole).includes(role)));
                },
                message: "Invalid role(s) specified",
            },
            {
                validator: function (roles) {
                    if (roles.includes(rbac_config_1.UserRole.ADMIN) && roles.length > 1) {
                        return false;
                    }
                    if (!roles.includes(rbac_config_1.UserRole.STUDENT) && roles.length > 1) {
                        return false;
                    }
                    if (roles.includes(rbac_config_1.UserRole.MENTOR) &&
                        roles.includes(rbac_config_1.UserRole.SELLER)) {
                        return false;
                    }
                    return true;
                },
                message: "Invalid role combination",
            },
        ],
    },
    status: {
        type: String,
        enum: Object.values(rbac_config_1.UserStatus),
        default: rbac_config_1.UserStatus.PENDING_VERIFICATION,
    },
    profile: {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            minlength: [2, "First name must be at least 2 characters"],
            maxlength: [50, "First name cannot exceed 50 characters"],
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            minlength: [2, "Last name must be at least 2 characters"],
            maxlength: [50, "Last name cannot exceed 50 characters"],
        },
        avatar: String,
        phone: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^\+?[\d\s-]{10,}$/.test(v);
                },
                message: "Invalid phone number format",
            },
        },
        address: {
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
        },
        bio: {
            type: String,
            maxlength: [500, "Bio cannot exceed 500 characters"],
        },
        socialLinks: {
            website: String,
            linkedin: String,
            twitter: String,
            facebook: String,
        },
    },
    roleSpecificData: {
        mentor: {
            expertise: [String],
            qualifications: [
                {
                    degree: String,
                    institution: String,
                    year: Number,
                    field: String,
                    certificate: String,
                },
            ],
            experience: Number,
            languages: [String],
            rating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            totalStudents: {
                type: Number,
                default: 0,
            },
            totalCourses: {
                type: Number,
                default: 0,
            },
            verified: {
                type: Boolean,
                default: false,
            },
            verificationDate: Date,
        },
        seller: {
            businessName: String,
            businessType: String,
            registrationNumber: String,
            taxId: String,
            businessAddress: {
                street: String,
                city: String,
                state: String,
                postalCode: String,
                country: String,
            },
            bankingDetails: {
                bankName: String,
                accountNumber: String,
                routingNumber: String,
                accountType: String,
            },
            rating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            totalSales: {
                type: Number,
                default: 0,
            },
            totalProducts: {
                type: Number,
                default: 0,
            },
            verified: {
                type: Boolean,
                default: false,
            },
            verificationDate: Date,
        },
        writer: {
            specializations: [String],
            languages: [
                {
                    language: String,
                    proficiencyLevel: {
                        type: String,
                        enum: ["Native", "Fluent", "Professional"],
                    },
                },
            ],
            experience: {
                years: Number,
                publications: [
                    {
                        title: String,
                        url: String,
                        date: Date,
                    },
                ],
            },
            portfolio: [String],
            rating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            totalArticles: {
                type: Number,
                default: 0,
            },
            verified: {
                type: Boolean,
                default: false,
            },
            verificationDate: Date,
        },
    },
    googleId: {
        type: String,
        sparse: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    verificationStatus: {
        email: {
            type: Boolean,
            default: false,
        },
        phone: Boolean,
        documents: Boolean,
        emailToken: String,
        emailTokenExpires: Date,
        phoneToken: String,
        phoneTokenExpires: Date,
    },
    security: {
        passwordChangedAt: Date,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        twoFactorSecret: String,
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: Date,
        refreshToken: String,
        refreshTokenExpires: Date,
    },
    preferences: {
        language: {
            type: String,
            default: "en",
        },
        timezone: {
            type: String,
            default: "UTC",
        },
        emailNotifications: {
            type: Boolean,
            default: true,
        },
        pushNotifications: {
            type: Boolean,
            default: true,
        },
        theme: {
            type: String,
            enum: ["light", "dark"],
            default: "light",
        },
    },
    lastLogin: Date,
}, {
    timestamps: true,
});
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
userSchema.methods.hasRole = function (role) {
    return this.roles.includes(role);
};
userSchema.index({ "profile.phone": 1 });
userSchema.index({ roles: 1 });
userSchema.index({ status: 1 });
userSchema.index({ "roleSpecificData.mentor.expertise": 1 });
userSchema.index({ "roleSpecificData.writer.specializations": 1 });
exports.UserModel = mongoose_1.default.model("User", userSchema);
//# sourceMappingURL=user.model.js.map