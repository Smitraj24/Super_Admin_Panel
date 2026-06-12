import {
  performCheckIn,
  performBreakIn,
  performBreakOut,
  performCheckOut,
  fetchTodayStatus,
  fetchByDateRange,
  fetchAllUsersAttendance,
  updateRecord,
  finishBreak,
  computeSummary,
  computeAllUsersSummary,
  computeUserSummary,
  computeDashboardStats,
  computeWeeklyStats,
  fetchUserAttendanceById,
} from "../services/attendanceService.js";

// ─── Employee actions 

export const checkIn = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { record, isLate } = await performCheckIn(req.user._id);
    res.json({
      message: isLate ? "Checked in successfully (Late)" : "Checked in successfully",
      record,
      isLate,
    });
  } catch (err) {
    const status = err.status || (err.code === 11000 ? 400 : 500);
    res.status(status).json({ message: err.message || "Error checking in" });
  }
};

export const breakIn = async (req, res) => {
  try {
    const record = await performBreakIn(req.user._id);
    res.json({ message: "Break started", record });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Error starting break" });
  }
};

export const breakOut = async (req, res) => {
  try {
    const record = await performBreakOut(req.user._id);
    res.json({ message: "Break ended", record });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Error ending break" });
  }
};

export const checkOut = async (req, res) => {
  try {
    const record = await performCheckOut(req.user._id);
    res.json({ message: "Checked out successfully", record });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Error checking out" });
  }
};

export const getTodayStatus = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(400).json({ message: "User ID is required" });
    res.json(await fetchTodayStatus(req.user._id));
  } catch (err) {
    res.status(500).json({ message: "Error fetching status" });
  }
};

// ─── Queries

export const getAttendanceByDate = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    const records = await fetchByDateRange(req.user._id, startDate, endDate, date);
    res.json(records);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Error fetching attendance" });
  }
};

// Kept for backward-compat with /monthly route — delegates to same service fn
export const getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const records = await fetchByDateRange(req.user._id, startDate, endDate);
    res.json(records);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ─── HR Admin

export const getAllUsersAttendance = async (req, res) => {
  try {
    const result = await fetchAllUsersAttendance(req.query, req.departmentFilter);
    res.json({
      data: result.data,
      pagination: { total: result.total, page: result.page, pages: Math.ceil(result.total / result.limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching attendance" });
  }
};

export const updateAttendanceRecord = async (req, res) => {
  try {
    const record = await updateRecord(req.params.id, req.body);
    res.json({ message: "Attendance updated successfully", record });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Error updating attendance" });
  }
};

export const completeBreakOut = async (req, res) => {
  try {
    const { breakIndex, breakOut } = req.body;
    const record = await finishBreak(req.params.id, breakIndex, breakOut);
    res.json({ message: "Break completed successfully", record });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Error completing break" });
  }
};

// ─── Summary & Stats 

export const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate)
      return res.status(400).json({ message: "startDate and endDate are required" });
    res.json(await computeSummary(req.user._id, startDate, endDate));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    res.json(await computeDashboardStats(req.user._id));
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching dashboard stats" });
  }
};

export const getWeeklyStats = async (req, res) => {
  try {
    res.json(await computeWeeklyStats());
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching weekly stats" });
  }
};

export const getAllUsersSummary = async (req, res) => {
  try {
    const now   = new Date();
    const year  = parseInt(req.query.year  || now.getFullYear());
    const month = parseInt(req.query.month || now.getMonth() + 1);
    if (month < 1 || month > 12) return res.status(400).json({ message: "Invalid month" });
    res.json(await computeAllUsersSummary(year, month));
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching users summary" });
  }
};

export const getUserSummaryById = async (req, res) => {
  try {
    const { userId } = req.params;
    const now   = new Date();
    const year  = parseInt(req.query.year  || now.getFullYear());
    const month = parseInt(req.query.month || now.getMonth() + 1);
    if (month < 1 || month > 12) return res.status(400).json({ message: "Invalid month" });
    res.json(await computeUserSummary(userId, year, month));
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching user summary" });
  }
};

export const getUserAttendanceById = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, startDate, endDate } = req.query;
    const result = await fetchUserAttendanceById(userId, { date, startDate, endDate });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Error fetching user attendance" });
  }
};
