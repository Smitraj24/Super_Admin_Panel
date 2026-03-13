import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.models.js";
import Role from "../models/Roles.models.js";
import Department from "../models/Department.models.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER USER
export const registerUser = async (name, email, password, role, department) => {
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error("User already exists");
  }

  const roleExists = await Role.findOne({ name: role });

  if (!roleExists) {
    throw new Error("Invalid role");
  }

  let departmentId = null;

  if (department) {
    const departmentExists = await Department.findOne({ name: department });

    if (!departmentExists) {
      throw new Error("Invalid department");
    }

    departmentId = departmentExists._id;
  }

  // HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: roleExists._id,
    department: departmentId,
  });

  const token = generateToken(user._id);

  return { user, token };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email })
    .populate("role")
    .populate("department");

  if (!user) {
    console.log("User not found");
    throw new Error("Invalid credentials");
  }

  console.log("Entered password:", password);
  console.log("DB password:", user.password);

  const isMatch = await bcrypt.compare(password, user.password);

  console.log("Password Match:", isMatch);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { user, token };
};
