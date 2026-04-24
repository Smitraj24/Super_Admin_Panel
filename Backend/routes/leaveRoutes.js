import express from "express";
import {
  applyLeave,
  getAllLeaves,
  getUserLeaves,
  updateLeaveStatus,
  getUserLeaveBalance,
  deleteUserLeave,
  updateUserLeave,
} from "../controllers/leaveController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/apply", applyLeave);

router.get("/user/own", getUserLeaves);

router.get("/user/balance", getUserLeaveBalance);

router.put("/user/:id", updateUserLeave);

router.delete("/user/:id", deleteUserLeave);

router.get("/", getAllLeaves);

router.put("/:id", updateLeaveStatus);

export default router;
