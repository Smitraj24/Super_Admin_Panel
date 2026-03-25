/**
 * Check if a user is an HR admin
 * @param {Object} user - The user object from req.user
 * @returns {Boolean} True if user is an ADMIN from HR department
 */
export const isHRAdmin = (user) => {
  return (
    user.role.name === "ADMIN" &&
    (user.department?.name === "HR" ||
      user.department?.name?.toUpperCase() === "HR")
  );
};

/**
 * Check if a user is a super admin
 * @param {Object} user - The user object from req.user
 * @returns {Boolean} True if user is SUPER_ADMIN
 */
export const isSuperAdmin = (user) => {
  return user.role.name === "SUPER_ADMIN";
};

/**
 * Check if a user is a regular admin (not HR, not Super)
 * @param {Object} user - The user object from req.user
 * @returns {Boolean} True if user is ADMIN but not from HR
 */
export const isRegularAdmin = (user) => {
  return user.role.name === "ADMIN" && !isHRAdmin(user);
};
