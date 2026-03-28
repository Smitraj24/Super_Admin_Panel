import express from "express";
import {
  checkIn,
  breakIn,
  breakOut,
  checkOut,
  getTodayStatus,
  getAttendanceByDate,
} from "../controllers/attendanceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All attendance routes require authentication
router.use(authMiddleware);

router.get("/", getAttendanceByDate); // Get attendance by date
router.post("/check-in", checkIn);
router.post("/break-in", breakIn);
router.post("/break-out", breakOut);
router.post("/check-out", checkOut);
router.get("/status", getTodayStatus);

export default router;
