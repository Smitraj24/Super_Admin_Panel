import jwt from "jsonwebtoken";
import User from "../models/User.models.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id)
        .populate("role")
        .populate("department");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;

      return next();
    }

    return res.status(401).json({ message: "Not authorized, no token" });
  } catch (error) {
    console.error("Auth Error:", error.message);

    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default authMiddleware;
