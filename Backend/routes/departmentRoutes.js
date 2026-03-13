import express from "express";
import {
  createDepartment,
  getDepartments,
} from "../controllers/departmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  createDepartment,
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN", "ADMIN"]),
  getDepartments,
);

export default router;
