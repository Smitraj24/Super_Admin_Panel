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
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply authentication and role middleware to all admin routes
router.use(authMiddleware);
router.use(roleMiddleware(["ADMIN", "SUPER_ADMIN"]));

router.get("/departments", getDepartments);
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

router.get("/roles", getRoles);
router.post("/roles", createRole);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

router.get("/users", getUser);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/stats", getDashboardStats);

export default router;
