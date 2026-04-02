import User from "../models/User.models.js";
import Department from "../models/Department.models.js";
import Role from "../models/Roles.models.js";
import { isHRAdmin } from "../utils/roleUtils.js";

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

    if (!userRole) {
      return res.status(400).json({
        message: "User role not found",
      });
    }

    // Apply department filter if admin (but not HR admin, SUPER_ADMIN has no filter)
    const filter = { role: userRole._id };

    if (req.departmentFilter && !isHRAdmin(req.user)) {
      Object.assign(filter, req.departmentFilter);
    }

    const users = await User.find(filter)
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
    const { name, email, password, department, sidebarPermissions } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const role = await Role.findOne({ name: "USER" });

    if (!role) {
      return res.status(400).json({
        message: "User role not found",
      });
    }

    if (
      req.user.role.name === "ADMIN" &&
      req.user.department &&
      !isHRAdmin(req.user)
    ) {
      if (department && department !== req.user.department._id.toString()) {
        return res.status(403).json({
          message: "Admins can only create users in their own department",
        });
      }
      // Use admin's department by default
      req.body.department = req.user.department._id;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Ensure password is set (minimum 6 characters as per schema validation)
    const userPassword = password || "123456";
    if (userPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.create({
      name,
      email,
      password: userPassword, // This will be hashed by pre-save hook
      role: role._id,
      department: req.body.department,
      createdBy: req.user._id,
      sidebarPermissions: sidebarPermissions || [],
    });

    // Fetch and return the user with populated fields (exclude password)
    const populatedUser = await User.findById(user._id)
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    res.status(201).json(populatedUser);
  } catch (error) {
    console.error("Create User Error:", error.message);
    res.status(400).json({
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, department, sidebarPermissions } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // If admin (not SUPER_ADMIN or HR admin), enforce department restriction
    if (
      req.user.role.name === "ADMIN" &&
      req.user.department &&
      !isHRAdmin(req.user)
    ) {
      if (user.department.toString() !== req.user.department._id.toString()) {
        return res.status(403).json({
          message: "You can only manage users in your own department",
        });
      }
      // Prevent admins from changing department
      if (department && department !== req.user.department._id.toString()) {
        return res.status(403).json({
          message: "Cannot change user to a different department",
        });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (sidebarPermissions) {
      user.sidebarPermissions = sidebarPermissions;
    }
    if (!req.departmentFilter || req.user.role.name === "SUPER_ADMIN") {
      user.department = department || user.department;
    }

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
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // If admin (not SUPER_ADMIN or HR admin), enforce department restriction
    if (
      req.user.role.name === "ADMIN" &&
      req.user.department &&
      !isHRAdmin(req.user)
    ) {
      if (user.department.toString() !== req.user.department._id.toString()) {
        return res.status(403).json({
          message: "You can only delete users in your own department",
        });
      }
    }

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

    // For ADMIN role (non-HR), filter by their department. HR admins see all
    let filter = { role: userRole?._id };
    if (
      req.user.role.name === "ADMIN" &&
      req.user.department &&
      !isHRAdmin(req.user)
    ) {
      filter.department = req.user.department._id;
    }

    const userCount = await User.countDocuments(filter);

    // Get department info
    let departmentCount = 1; // ADMIN sees their own department
    let departmentName = "All Departments";

    if (req.user.role.name === "ADMIN" && req.user.department) {
      if (isHRAdmin(req.user)) {
        // HR admin sees all departments
        departmentCount = await Department.countDocuments();
        departmentName = "All Departments (HR)";
      } else {
        const dept = await Department.findById(req.user.department._id);
        departmentName = dept?.name || "Unknown";
        departmentCount = 1;
      }
    } else if (req.user.role.name === "SUPER_ADMIN") {
      departmentCount = await Department.countDocuments();
    }

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
        departmentName: departmentName,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== ADMIN MANAGEMENT ====================
export const getAdmins = async (req, res) => {
  try {
    const adminRole = await Role.findOne({ name: "ADMIN" });

    if (!adminRole) {
      return res.status(404).json({
        message: "ADMIN role not found",
      });
    }

    let filter = { role: adminRole._id };

    // Only restrict if it's an admin that's NOT from HR department
    if (
      req.user.role.name === "ADMIN" &&
      req.user.department &&
      !isHRAdmin(req.user)
    ) {
      filter.department = req.user.department._id;
    }

    const admins = await User.find(filter)
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    res.json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // If regular admin (not HR), they can only create admins in their department
    if (
      req.user.role.name === "ADMIN" &&
      req.user.department &&
      !isHRAdmin(req.user)
    ) {
      if (department !== req.user.department._id.toString()) {
        return res.status(403).json({
          message: "You can only create admins in your own department",
        });
      }
    }

    const { createUser } = await import("../services/userService.js");

    const user = await createUser(
      name,
      email,
      password || "123456",
      "ADMIN",
      department,
      req.user._id,
    );

    const createdAdmin = await User.findById(user._id)
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    res.status(201).json(createdAdmin);
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department } = req.body;

    const admin = await User.findById(id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    // If regular admin (not HR), they can only update admins in their department
    if (
      req.user.role.name === "ADMIN" &&
      req.user.department &&
      !isHRAdmin(req.user)
    ) {
      if (admin.department.toString() !== req.user.department._id.toString()) {
        return res.status(403).json({
          message: "You can only update admins in your own department",
        });
      }
    }

    const updatedAdmin = await User.findByIdAndUpdate(
      id,
      { name, email, department },
      { new: true },
    )
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    res.json(updatedAdmin);
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    // If regular admin (not HR), they can only delete admins in their department
    if (
      req.user.role.name === "ADMIN" &&
      req.user.department &&
      !isHRAdmin(req.user)
    ) {
      if (admin.department.toString() !== req.user.department._id.toString()) {
        return res.status(403).json({
          message: "You can only delete admins in your own department",
        });
      }
    }

    const { deleteUserById } = await import("../services/userService.js");
    await deleteUserById(id);

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
