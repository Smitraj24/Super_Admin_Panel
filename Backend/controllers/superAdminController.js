import User from "../models/User.models.js";
import Role from "../models/Roles.models.js";
import Department from "../models/Department.models.js";
import bcrypt from "bcryptjs";

export const getAdmins = async (req, res) => {
  try {
    const role = await Role.findOne({ name: "ADMIN" });

    const admins = await User.find({ role: role._id })
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    res.json(admins);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const role = await Role.findOne({ name: "ADMIN" });

    if (!role) {
      return res.status(400).json({
        message: "Admin role not found",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role._id,
      department,
    });

    const populatedAdmin = await User.findById(admin._id)
      .populate("role", "name")
      .populate("department", "name");

    res.status(201).json(populatedAdmin);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { name, email, department } = req.body;

    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.department = department || admin.department;

    await admin.save();

    const updatedAdmin = await User.findById(admin._id)
      .populate("role", "name")
      .populate("department", "name")
      .select("-password");

    res.json(updatedAdmin);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "Admin deleted successfully",
    });
  } catch (error) {
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
    const role = await Role.findOne({ name: "USER" });

    const users = await User.find({ role: role._id })
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
    const userCount = await User.countDocuments();
    const adminRole = await Role.findOne({ name: "ADMIN" });
    const adminCount = await User.countDocuments({ role: adminRole?._id });
    const departmentCount = await Department.countDocuments();
    const roleCount = await Role.countDocuments();

    const userGrowth = [
      { month: "Jan", users: 200 },
      { month: "Feb", users: 400 },
      { month: "Mar", users: 650 },
      { month: "Apr", users: 800 },
      { month: "May", users: 1000 },
      { month: "Jun", users: userCount },
    ];

    const departments = await Department.find();
    const departmentUsage = await Promise.all(
      departments.map(async (dept) => {
        const count = await User.countDocuments({ department: dept._id });
        return { name: dept.name, users: count };
      }),
    );

    res.json({
      stats: {
        users: userCount,
        admins: adminCount,
        departments: departmentCount,
        roles: roleCount,
      },
      userGrowth,
      departmentUsage,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
