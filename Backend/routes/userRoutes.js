import express from "express";
import {
  getProfile,
  updateProfile,
  deleteUser,
  getUser,
  getUpcomingBirthdays,
  uploadProfilePhoto,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import { PERMISSIONS } from "../config/permissions.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

router.get("/users", authMiddleware, getUser);
router.get("/upcoming-birthdays", authMiddleware, getUpcomingBirthdays);

// routes/user.routes.js

router.put(
  "/profile/profile-photo",
  authMiddleware,
  upload.single("profileImage"),
  uploadProfilePhoto,
);

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware(PERMISSIONS.DELETE_USER),
  deleteUser,
);

export default router;
