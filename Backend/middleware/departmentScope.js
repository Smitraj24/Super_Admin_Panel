const departmentScope = (req, res, next) => {
  if (req.user.role.name === "SUPER_ADMIN") {
    return next(); // Super Admin can access everything
  }

  if (
    req.user.department?.name === "HR" ||
    req.user.department?.name?.toUpperCase() === "HR"
  ) {
    return next(); 
  }

  if (!req.user.department) {
    return res.status(403).json({
      message: "No department assigned",
    });
  }

  req.departmentFilter = { department: req.user.department._id };

  return next();
};

export default departmentScope;
