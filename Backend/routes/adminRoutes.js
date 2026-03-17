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


router.use(roleMiddleware(["ADMIN", "SUPER_ADMIN"]));

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
