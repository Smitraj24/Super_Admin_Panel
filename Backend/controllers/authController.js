import bcrypt from "bcryptjs";
import User from "../models/User.models.js";
import Role from "../models/Roles.models.js";
import { registerValidation } from "../validations/authValidation.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { name, email, password, role, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Find the role by name, default to USER if not provided
    const roleName = role || "USER";
    const roleDoc = await Role.findOne({ name: roleName });
    if (!roleDoc) {
      return res.status(400).json({ message: `Role ${roleName} not found` });
    }

    // Create user with plain password - pre-save hook will hash it
    const user = await User.create({
      name,
      email,
      password, // This will be hashed by pre-save hook
      role: roleDoc._id,
      department,
    });

    // Fetch populated user (password will be excluded if needed)
    const populatedUser = await User.findById(user._id)
      .populate("role")
      .populate("department");

    const token = generateToken(populatedUser);

    return res.status(201).json({
      success: true,
      token,
      user: populatedUser,
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(" Login Attempt:", {
      email,
      passwordLength: password?.length,
    });

    const user = await User.findOne({ email })
      .populate("role")
      .populate("department");

    if (!user) {
      console.error(" User not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(" User found:", {
      email,
      hashedPassword: user.password?.substring(0, 10),
    });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(" Password match:", isMatch);

    if (!isMatch) {
      console.error(" Password mismatch for user:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const populatedUser = await User.findById(user._id)
      .populate("role")
      .populate("department");

    const token = generateToken(populatedUser);

    return res.status(200).json({
      success: true,
      token,
      user: populatedUser,
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
