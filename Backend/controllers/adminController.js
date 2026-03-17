import User from "../models/User.models.js";
import Department from "../models/Department.models.js";
import Role from "../models/Roles.models.js";
import bcrypt from "bcryptjs";

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();

    res.json(departments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    const department = await Department.create({
      name,
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);

    res.json({
      message: "Department deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true },
    );

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const getUser = async (req, res) => {
  try {
    const userRole = await Role.findOne({ name: "USER" });

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
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find();

    res.json(roles);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, permissions = [] } = req.body;

    const role = await Role.create({
      name,
      permissions,
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, permissions },
      { new: true },
    );

    if (!role) {
      return res.status(404).json({
        message: "Role not found or cannot be updated",
      });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteRole = async (req, res) => {
  try {
    await Role.findByIdAndDelete(req.params.id);

    res.json({
      message: "Role deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const createUser = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const role = await Role.findOne({ name: "USER" });

    if (!role) {
      return res.status(400).json({
        message: "User role not found",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password || "123456", 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role._id,
      department,
    });

    const populatedUser = await User.findById(user._id)
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    res.status(201).json(populatedUser);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, department } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.department = department || user.department;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const getDashboardStats = async (req, res) => {
  try {
    const userRole = await Role.findOne({ name: "USER" });
    const userCount = await User.countDocuments({ role: userRole?._id });
    const departmentCount = await Department.countDocuments();
    const roleCount = await Role.countDocuments();

    // Active today could be users who logged in today (if we had a lastLogin field)
    // For now we'll mock some data or use a subset
    const activeToday = Math.floor(userCount * 0.3);

    res.json({
      stats: {
        totalUsers: userCount,
        departments: departmentCount,
        activeToday: activeToday,
        roles: roleCount,
      },
      recentActivity: [
        { id: 1, text: "New user registered", time: "2 hours ago" },
        { id: 2, text: "Admin updated department", time: "4 hours ago" },
        { id: 3, text: "User logged in", time: "5 hours ago" },
      ],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
