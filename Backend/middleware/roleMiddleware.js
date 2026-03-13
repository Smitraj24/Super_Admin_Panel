import role from "../models/Roles.models.js";

const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!allowedRoles.includes(req.user.role.name)) {
      return res.status(403).json({
        message: "Access denied: Role not allowed",
      });
    }

    return next();
  };
};

export default roleMiddleware;
