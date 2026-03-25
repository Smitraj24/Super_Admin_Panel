import express from "express";
import {
  applyLeave,
  getAllLeaves,
  getUserLeaves,
  updateLeaveStatus,
} from "../controllers/leaveController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/apply", applyLeave);

router.get("/user/own", getUserLeaves);

router.get("/", getAllLeaves);

router.put("/:id", updateLeaveStatus);

export default router;
