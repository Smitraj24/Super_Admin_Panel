import jwt from "jsonwebtoken";

// Accept either a user object or an id string. When a user object is
// provided include role and department names for convenience on the client.
const generateToken = (userOrId) => {
  let payload = {};

  if (!userOrId) throw new Error("generateToken requires a user or id");

  if (
    typeof userOrId === "string" ||
    (typeof userOrId === "object" && userOrId._id)
  ) {
    const user = typeof userOrId === "string" ? { _id: userOrId } : userOrId;

    payload.id = user._id || user.id;

    // Attach role name if available
    if (user.role) {
      payload.role = typeof user.role === "object" ? user.role.name : user.role;
    }

    // Attach department name and id if available
    if (user.department) {
      payload.department =
        typeof user.department === "object"
          ? {
              id: user.department._id || user.department.id,
              name: user.department.name,
            }
          : { id: user.department, name: null };
    }
  } else {
    throw new Error("Unsupported argument to generateToken");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default generateToken;
