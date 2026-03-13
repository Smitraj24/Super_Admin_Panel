import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    descriptions: {
      type: String,
    },
    permissions: [
      {
        type: String,
      },
    ],
    isSystemRole: {
      type: Boolean,
      default: false, // true for SUPER_ADMIN etc.
    },
  },
  { timestamps: true },
);

export default mongoose.model("Role", RoleSchema);
