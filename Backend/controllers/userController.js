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

export const getProfile = async (req, res) => {
  try {
    const profile = await getUserProfile(req.user);

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
