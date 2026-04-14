import express from "express";
import {
  checkIn,
  breakIn,
  breakOut,
  checkOut,
  getTodayStatus,
  getAttendanceByDate,
  getAttendanceByDateRange,
  getAllUsersAttendance,
  updateAttendanceRecord,
  completeBreakOut,
  getAttendanceSummary,
} from "../controllers/attendanceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import departmentScope from "../middleware/departmentScope.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAttendanceByDate);
router.post("/check-in", checkIn);
router.post("/break-in", breakIn);
router.post("/break-out", breakOut);
router.post("/check-out", checkOut);
router.get("/status", getTodayStatus);
router.get("/monthly", getAttendanceByDateRange);

// HR Admin routes
router.get(
  "/all",
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  departmentScope,
  getAllUsersAttendance,
);
router.put(
  "/:id",
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  departmentScope,
  updateAttendanceRecord,
);
router.put(
  "/:id/complete-break",
  roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
  departmentScope,
  completeBreakOut,
);

router.get("/summary", getAttendanceSummary);

export default router;
