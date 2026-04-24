import User from "../models/User.models.js";
import Role from "../models/Roles.models.js";

export const createUser = async (
  name,
  email,
  password,
  roleName,
  departmentId,
  createdBy,
  joiningDate,
  probationEndDate,
  leaveBalance,
) => {
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error("User already exists");
  }

  const role = await Role.findOne({ name: roleName });

  if (!role) {
    throw new Error("Role not found");
  }

  // Ensure password is provided and valid
  const finalPassword = password || "123456";
  if (!finalPassword || finalPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const user = await User.create({
    name,
    email,
    password: finalPassword, // This will be hashed by pre-save hook
    role: role._id,
    department: departmentId,
    createdBy,
    joiningDate: joiningDate || new Date(),
    probationEndDate: probationEndDate,
    leaveBalance: leaveBalance || { PL: 0, CL: 0, SL: 0, DL: 0 },
  });

  // Return user with populated fields and password excluded
  const populatedUser = await User.findById(user._id)
    .populate("role", "name")
    .populate("department", "name")
    .select("-password");

  return populatedUser;
};

export const getUsersByDepartment = async (departmentId) => {
  return await User.find({ department: departmentId }).populate("role");
};

export const deleteUserById = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  await user.deleteOne();

  return { message: "User deleted successfully" };
};

export const getUserProfile = async (user) => {
  return user;
};
