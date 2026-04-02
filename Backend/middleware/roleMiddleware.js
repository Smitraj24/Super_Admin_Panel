import role from "../models/Roles.models.js";

const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    console.log("[ROLE MIDDLEWARE] Checking access...");
    console.log("[ROLE MIDDLEWARE] User exists:", !!req.user);
    console.log("[ROLE MIDDLEWARE] User role:", req.user?.role);
    console.log("[ROLE MIDDLEWARE] User role name:", req.user?.role?.name);
    console.log("[ROLE MIDDLEWARE] Allowed roles:", allowedRoles);
    
    if (!req.user || !req.user.role) {
      console.log("[ROLE MIDDLEWARE] Access denied - no user or role");
      return res.status(403).json({ message: "Access denied" });
    }

    if (!allowedRoles.includes(req.user.role.name)) {
      console.log("[ROLE MIDDLEWARE] Access denied - role not allowed");
      return res.status(403).json({
        message: "Access denied: Role not allowed",
      });
    }

    console.log("[ROLE MIDDLEWARE] Access granted");
    return next();
  };
};

export default roleMiddleware;
