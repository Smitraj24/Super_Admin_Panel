import User from "../models/User.models.js";
import Role from "../models/Roles.models.js";
import Department from "../models/Department.models.js";
import AuditLogs from "../models/AuditLogs.models.js";
import {
  createUserValidation,
  updateUserValidation,
} from "../validations/userValidation.js";
import {
  createUser as createUserService,
  deleteUserById,
} from "../services/userService.js";

export const getAdmins = async (req, res) => {
  try {
    const adminRole = await Role.findOne({ name: "ADMIN" });

    if (!adminRole) {
      return res.status(404).json({
        message: "ADMIN role not found",
      });
    }

    const admins = await User.find({ role: adminRole._id })
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    res.json(admins);
  } catch (error) {
    console.error(" Error fetching admins:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    console.log("👤 Creating admin:", { name, email, department });

    const user = await createUserService(
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

    console.log("✓ Admin created successfully:", createdAdmin._id);

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

    const admin = await User.findByIdAndUpdate(
      id,
      { name, email, department },
      { new: true },
    )
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    res.json(admin);
  } catch (error) {
    console.error(" Error updating admin:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUserById(id);

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(" Error deleting admin:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    console.error(" Error fetching departments:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    const deptExists = await Department.findOne({ name });
    if (deptExists) {
      return res.status(400).json({
        message: "Department already exists",
      });
    }

    const department = await Department.create({ name });
    res.status(201).json(department);
  } catch (error) {
    console.error(" Error creating department:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const department = await Department.findByIdAndUpdate(
      id,
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
    console.error(" Error updating department:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error(" Error deleting department:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const userRole = await Role.findOne({ name: "USER" });

    if (!userRole) {
      return res.status(404).json({
        message: "USER role not found",
      });
    }

    const filter = { role: userRole._id };
    if (req.user.role.name === "ADMIN" && req.user.department) {
      filter.department = req.user.department._id;
    }

    const users = await User.find(filter)
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    res.json(users);
  } catch (error) {
    console.error(" Error fetching users:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, department, sidebarPermissions } = req.body;

    console.log("👤 Creating user:", {
      name,
      email,
      department,
      sidebarPermissions,
    });

    const role = await Role.findOne({ name: "USER" });

    if (!role) {
      return res.status(400).json({
        message: "USER role not found",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Pass plain password - let the model's pre-save hook hash it
    const user = await User.create({
      name,
      email,
      password: password || "123456",
      role: role._id,
      department,
      createdBy: req.user._id,
      sidebarPermissions: sidebarPermissions || [],
    });

    const createdUser = await User.findById(user._id)
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    console.log("✓ User created successfully:", createdUser._id);

    res.status(201).json(createdUser);
  } catch (error) {
    console.error(" Error creating user:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, department },
      { new: true },
    )
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error(" Error updating user:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUserById(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(" Error deleting user:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userRole = await Role.findOne({ name: "USER" });
    const adminRole = await Role.findOne({ name: "ADMIN" });

    const totalUsers = await User.countDocuments({ role: userRole._id });
    const totalAdmins = await User.countDocuments({ role: adminRole._id });
    const totalDepartments = await Department.countDocuments();
    const totalRoles = await Role.countDocuments();

    const recentAuditLogs = await AuditLogs.find()
      .limit(10)
      .sort({ createdAt: -1 });

    const userGrowth = [
      { month: "Jan", users: await User.countDocuments() },
      { month: "Feb", users: await User.countDocuments() },
      { month: "Mar", users: await User.countDocuments() },
      { month: "Apr", users: await User.countDocuments() },
    ];

    const departments = await Department.find();

    const departmentUsage = [];

    for (let dept of departments) {
      const count = await User.countDocuments({ department: dept._id });

      departmentUsage.push({
        name: dept.name,
        users: count,
      });
    }

    res.json({
      stats: {
        users: totalUsers,
        admins: totalAdmins,
        departments: totalDepartments,
        roles: totalRoles,
      },
      userGrowth,
      departmentUsage,
      recentAuditLogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
