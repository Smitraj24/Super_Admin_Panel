import express from "express";
import { createRole, getRoles } from "../controllers/roleController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  createRole,
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN", "ADMIN"]),
  getRoles,
);

export default router;
