import { Schema, model, Document } from "mongoose";
import { UserRole } from "../config/rbac.config";

export interface IPermissionOverride extends Document {
  role: UserRole;
  permissions: string[];
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const permissionOverrideSchema = new Schema<IPermissionOverride>(
  {
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      unique: true,
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PermissionOverrideModel = model<IPermissionOverride>(
  "PermissionOverride",
  permissionOverrideSchema
);
