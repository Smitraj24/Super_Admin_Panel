import express from "express";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getDashboardStats,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import departmentScope from "../middleware/departmentScope.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/departments",
  roleMiddleware(["ADMIN", "SUPER_ADMIN", "USER"]),
  getDepartments,
);
router.post(
  "/departments",
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  createDepartment,
);
router.put(
  "/departments/:id",
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  updateDepartment,
);
router.delete(
  "/departments/:id",
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  deleteDepartment,
);

router.use(roleMiddleware(["ADMIN", "SUPER_ADMIN", "CE", "HR", "IT", "SALES"]));

// Apply department scope to admin routes (SUPER_ADMIN bypasses)
router.use(departmentScope);

router.get("/roles", getRoles);
router.post("/roles", createRole);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

// User routes - admins can only manage their department users
router.get("/users", getUser);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Admin routes - admins can only manage admins in their department
router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.put("/admins/:id", updateAdmin);
router.delete("/admins/:id", deleteAdmin);

router.get("/stats", getDashboardStats);

export default router;
