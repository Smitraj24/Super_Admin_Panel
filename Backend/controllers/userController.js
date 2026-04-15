import {
  createUserValidation,
  updateUserValidation,
} from "../validations/userValidation.js";

import {
  createUser,
  deleteUserById,
  getUserProfile,
  getUsersByDepartment,
} from "../services/userService.js";

import User from "../models/User.models.js";
import Role from "../models/Roles.models.js";

export const getUser = async (req, res) => {
  try {
    const userRole = await Role.findOne({ name: "USER" });        

    if (!userRole) {
      return res.status(404).json({
        message: "USER role not found",
      });
    }

    const users = await User.find({ role: userRole._id })
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await getUserProfile(req.user);

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    )
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message || "Error updating profile" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const response = await deleteUserById(req.params.id);

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUserController = async (req, res) => {
  const { error } = createUserValidation(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  try {
    const { name, email, password, roleName, department } = req.body;

    const user = await createUser(
      name,
      email,
      password,
      roleName,
      department,
      req.user._id,
    );

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const { error } = updateUserValidation(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
