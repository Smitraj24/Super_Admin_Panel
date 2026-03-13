import express from "express";
import { getProfile, deleteUser } from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(PERMISSIONS.DELETE_USER),
  deleteUser,
);

export default router;
