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
  getAllUsersWithLeaves,
  getUserLeaveHistory,
} from "../controllers/superAdminController.js";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";
import {
  getAllLeavesForSuperAdmin,
  updateLeaveStatusBySuperAdmin,
} from "../controllers/leaveController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import auditMiddleware from "../middleware/auditMiddleware.js";

const router = express.Router();


router.use(authMiddleware);
router.use(roleMiddleware(["SUPER_ADMIN"]));

router.get("/admins", getAdmins);
router.post("/admins", auditMiddleware("Created new admin"), createAdmin);
router.put("/admins/:id", auditMiddleware("Updated admin"), updateAdmin);
router.delete("/admins/:id", auditMiddleware("Deleted admin"), deleteAdmin);

router.get("/departments", getDepartments);
router.post("/departments", auditMiddleware("Created new department"), createDepartment);
router.put("/departments/:id", auditMiddleware("Updated department"), updateDepartment);
router.delete("/departments/:id", auditMiddleware("Deleted department"), deleteDepartment);

router.get("/roles", getRoles);
router.post("/roles", auditMiddleware("Created new role"), createRole);
router.put("/roles/:id", auditMiddleware("Updated role"), updateRole);
router.delete("/roles/:id", auditMiddleware("Deleted role"), deleteRole);

router.get("/users", getUser);
router.post("/users", auditMiddleware("Created new user"), createUser);
router.put("/users/:id", auditMiddleware("Updated user"), updateUser);
router.delete("/users/:id", auditMiddleware("Deleted user"), deleteUser);

router.get("/stats", getDashboardStats);

router.get("/leaves", getAllLeavesForSuperAdmin);
router.put("/leaves/:id", auditMiddleware("Updated leave status"), updateLeaveStatusBySuperAdmin);

router.get("/leaves/users", getAllUsersWithLeaves);
router.get("/leaves/users/:userId", getUserLeaveHistory);

export default router;
