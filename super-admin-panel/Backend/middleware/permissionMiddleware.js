const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = req.user.role.permissions;

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        message: "Access denied: Permission missing",
      });
    }

    return next();
  };
};

export default permissionMiddleware;
