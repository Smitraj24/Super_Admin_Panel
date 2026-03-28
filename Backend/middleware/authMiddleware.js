import jwt from "jsonwebtoken";
import User from "../models/User.models.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    console.log("[AUTH] Authorization header:", authHeader ? "present" : "missing");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log("[AUTH] Token extracted, verifying...");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("[AUTH] Token decoded, userId:", decoded.id);

      const user = await User.findById(decoded.id)
        .populate("role")
        .populate("department");

      if (!user) {
        console.error("[AUTH] User not found for id:", decoded.id);
        return res.status(401).json({ message: "User not found" });
      }

      console.log("[AUTH] User found, setting req.user. User _id:", user._id);
      req.user = user;

      return next();
    }

    console.error("[AUTH] No token provided");
    return res.status(401).json({ message: "Not authorized, no token" });
  } catch (error) {
    console.error("[AUTH] Error:", error.message, error.stack);

    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default authMiddleware;
