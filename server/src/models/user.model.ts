import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";
import {
  UserRole,
  UserStatus,
  validateRoleConstraints,
  getRoleConstraintViolationMessage,
} from "../config/rbac.config";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  roles: UserRole[];
  status: UserStatus;
  customPermissions?: string[];
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    bio?: string;
    socialLinks?: {
      website?: string;
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
  };
  roleSpecificData: {
    user?: {
      lastActiveAt: Date;
      interests: string[];
      preferences: {
        contentLanguages: string[];
        contentTypes: string[];
        notificationFrequency: "immediate" | "daily" | "weekly";
      };
    };
    mentor?: {
      expertise: string[];
      qualifications: Array<{
        degree: string;
        institution: string;
        year: number;
        field: string;
        certificate?: string;
      }>;
      experience: number;
      languages: string[];
      rating: number;
      totalStudents: number;
      totalCourses: number;
      verified: boolean;
      verificationDate?: Date;
    };
    seller?: {
      businessName: string;
      businessType: string;
      registrationNumber: string;
      taxId: string;
      businessAddress: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
      bankingDetails: {
        bankName: string;
        accountNumber: string;
        routingNumber: string;
        accountType: string;
      };
      rating: number;
      totalSales: number;
      totalProducts: number;
      verified: boolean;
      verificationDate?: Date;
    };
    writer?: {
      specializations: string[];
      languages: Array<{
        language: string;
        proficiencyLevel: string;
      }>;
      experience: {
        years: number;
        publications?: Array<{
          title: string;
          url?: string;
          date: Date;
        }>;
      };
      portfolio: string[];
      rating: number;
      totalArticles: number;
      verified: boolean;
      verificationDate?: Date;
    };
  };
  googleId?: string;
  emailVerified: boolean;
  verificationStatus: {
    email: boolean;
    phone?: boolean;
    documents?: boolean;
    emailToken?: string;
    emailTokenExpires?: Date;
    phoneToken?: string;
    phoneTokenExpires?: Date;
  };
  security: {
    passwordChangedAt?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    loginAttempts: number;
    lockUntil?: Date;
    refreshToken?: string;
    refreshTokenExpires?: Date;
    passwordResetAttempts: number;
  };
  preferences: {
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: "light" | "dark";
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  hasRole(role: UserRole): boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string) => {
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
      enum: Object.values(UserRole),
      default: [UserRole.USER],
      validate: [
        {
          validator: function (roles: UserRole[]) {
            return (
              roles.length > 0 &&
              roles.every((role) => Object.values(UserRole).includes(role))
            );
          },
          message: "Invalid role(s) specified",
        },
        {
          validator: function (roles: UserRole[]) {
            return validateRoleConstraints(roles);
          },
          message: function (props: any) {
            const message = getRoleConstraintViolationMessage(props.value);
            return message || "Invalid role combination";
          },
        },
      ],
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING_VERIFICATION,
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
          validator: function (v: string) {
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
      user: {
        lastActiveAt: Date,
        interests: [String],
        preferences: {
          contentLanguages: [String],
          contentTypes: [String],
          notificationFrequency: {
            type: String,
            enum: ["immediate", "daily", "weekly"],
            default: "immediate",
          },
        },
      },
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
      passwordResetAttempts: {
        type: Number,
        default: 0,
      },
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
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user has a specific role
userSchema.methods.hasRole = function (role: UserRole): boolean {
  return this.roles.includes(role);
};

// Indexes
userSchema.index({ "profile.phone": 1 });
userSchema.index({ roles: 1 });
userSchema.index({ status: 1 });
userSchema.index({ "roleSpecificData.mentor.expertise": 1 });
userSchema.index({ "roleSpecificData.writer.specializations": 1 });

export const UserModel = mongoose.model<IUser>("User", userSchema);
