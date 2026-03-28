import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sidebarPermissions: {
      type: [String],
      default: [],
      description: "Array of sidebar menu item names user has access to",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },                                                                                                                                                                                                                                
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  // Only hash password if it has been modified
  if (!this.isModified("password")) {
    console.log(" Password not modified, skipping hash");
    return next();
  }

  // Skip hashing if password is already hashed (starts with $2)
  if (this.password && this.password.startsWith("$2")) {
    console.log(" Password already hashed, skipping re-hash");
    return next();
  }

  console.log(" Pre-save hook: Hashing password...");
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(" Password hashed successfully");
    next();
  } catch (error) {
    console.error(" Password hashing error:", error.message);
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
