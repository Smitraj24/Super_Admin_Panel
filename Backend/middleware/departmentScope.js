const departmentScope = (req, res, next) => {
  try {
    // Check if user exists
    if (!req.user) {
      return res.status(403).json({
        message: "User not authenticated",
      });
    }

    // Check if role exists
    if (!req.user.role) {
      return res.status(403).json({
        message: "User role not found",
      });
    }

    // Get role name - handle both populated object and string
    const roleName = typeof req.user.role === 'object' 
      ? req.user.role.name 
      : req.user.role;

    // Super Admin can access everything - no department required
    if (roleName === "SUPER_ADMIN") {
      return next();
    }

    // HR department can access everything
    const departmentName = req.user.department?.name;
    if (departmentName === "HR" || departmentName?.toUpperCase() === "HR") {
      return next(); 
    }

    // For other roles, department is required
    if (!req.user.department) {
      return res.status(403).json({
        message: "No department assigned",
      });
    }

    // Set department filter for scoped access
    req.departmentFilter = { department: req.user.department._id };

    return next();
  } catch (error) {
    console.error("Department Scope Error:", error.message);
    return res.status(500).json({
      message: "Error checking department scope",
    });
  }
};

export default departmentScope;
