import User from "../models/User.models.js";
import Role from "../models/Roles.models.js";

export const createUser = async (
  name,
  email,
  password,
  roleName,
  departmentId,
  createdBy,
) => {
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error("User already exists");
  }

  const role = await Role.findOne({ name: roleName });

  if (!role) {
    throw new Error("Role not found");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role._id,
    department: departmentId,
    createdBy,
  });

  return user;
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
