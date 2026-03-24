import express from "express";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getDashboardStats,
} from "../controllers/superAdminController.js";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


router.use(authMiddleware);
router.use(roleMiddleware(["SUPER_ADMIN"]));

router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.put("/admins/:id", updateAdmin);
router.delete("/admins/:id", deleteAdmin);

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
