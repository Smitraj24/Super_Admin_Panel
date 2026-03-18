import User from "../models/User.models.js";
import Role from "../models/Roles.models.js";
import bcrypt from "bcryptjs";

export const createUserByAdminService = async (data) => {
  const { name, email, password, role, department } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already exists");

  const roleDoc = await Role.findOne({ name: role });
  if (!roleDoc) throw new Error("Role not found");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role: roleDoc._id,
    department,
  });

  await user.save();

  return await user
    .populate("role", "name")
    .populate("department", "name")
    .execPopulate();
};

export const getDepartmentUsersService = async (adminUser) => {
  const users = await User.find({ department: adminUser.department })
    .populate("role", "name")
    .populate("department", "name")
    .select("-password");

  return users;
};

export const getUserByIdService = async (id) => {
  const user = await User.findById(id)
    .populate("role", "name")
    .populate("department", "name")
    .select("-password");
  if (!user) throw new Error("User not found");
  return user;
};


export const updateUserService = async (id, data) => {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found");

  const { name, email, password, role, department } = data;

  user.name = name;
  user.email = email;
  user.department = department;

  if (role) {
    const roleDoc = await Role.findOne({ name: role });
    if (!roleDoc) throw new Error("Role not found");
    user.role = roleDoc._id;
  }

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();
  return await user
    .populate("role", "name")
    .populate("department", "name")
    .execPopulate();
};


export const deleteUserService = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("User not found");
  return { message: "User deleted successfully" };
};
