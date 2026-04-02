import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
const getToday = () => new Date().toISOString().split("T")[0];

export const checkIn = async (req, res) => {
  try {
    console.log("[CHECK-IN] Starting check-in process");
    console.log("[CHECK-IN] req.user exists:", !!req.user);
    console.log("[CHECK-IN] req.user._id:", req.user?._id || "UNDEFINED");

    if (!req.user) {
      console.error("[CHECK-IN] ERROR: req.user is not set");
      return res
        .status(401)
        .json({ message: "Unauthorized - user not authenticated" });
    }

    const userId = req.user._id;

    if (!userId || typeof userId !== "object") {
      console.error("[CHECK-IN] ERROR: Invalid userId:", userId);
      return res
        .status(400)
        .json({ message: "User ID is required and invalid" });
    }

    const today = getToday();
    console.log("[CHECK-IN] Attempt:", { userId: userId.toString(), today });

    // Check if already checked in today
    const existing = await Attendance.findOne({ userId, date: today });
    if (existing) {
      console.log("[CHECK-IN] Already checked in today");
      return res.status(400).json({ message: "Already checked in" });
    }

    // Ensure userId is valid before creating
    if (!userId || userId.toString() === "null" || userId.toString() === "") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    console.log(
      "[CHECK-IN] Creating attendance record with userId:",
      userId.toString(),
    );
    const record = await Attendance.create({
      userId: new mongoose.Types.ObjectId(userId),
      date: today,
      checkIn: new Date(),
      status: "CHECKED_IN",
    });

    console.log("[CHECK-IN] Attendance record created:", record._id);

    const populatedRecord = await Attendance.findById(record._id).populate(
      "userId",
      "email name _id",
    );

    console.log("[CHECK-IN] Check In successful for user:", userId);
    res.json({ message: "Checked in successfully", record: populatedRecord });
  } catch (error) {
    console.error("[CHECK-IN] Error:", error.message);
    console.error("[CHECK-IN] Stack:", error.stack);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already checked in today" });
    }
    res.status(500).json({ message: error.message || "Error checking in" });
  }
};

export const breakIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getToday();

    const record = await Attendance.findOne({ userId, date: today });

    if (!record || !["CHECKED_IN", "BACK_TO_WORK"].includes(record.status)) {
      return res.status(400).json({ message: "Cannot start break" });
    }

    record.breaks.push({ breakIn: new Date() });
    record.status = "ON_BREAK";

    await record.save();

    const populatedRecord = await Attendance.findById(record._id).populate(
      "userId",
      "email name _id",
    );

    res.json({ message: "Break started", record: populatedRecord });
  } catch (error) {
    console.error("Break In Error:", error.message);
    res.status(500).json({ message: error.message || "Error starting break" });
  }
};

export const breakOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getToday();

    const record = await Attendance.findOne({ userId, date: today });
    if (!record || record.status !== "ON_BREAK") {
      return res.status(400).json({ message: "Cannot end break" });
    }

    const lastBreak = record.breaks[record.breaks.length - 1];
    if (!lastBreak || lastBreak.breakOut) {
      return res.status(400).json({ message: "No active break found" });
    }

    lastBreak.breakOut = new Date();
    record.status = "BACK_TO_WORK";

    await record.save();

    const populatedRecord = await Attendance.findById(record._id).populate(
      "userId",
      "email name _id",
    );

    res.json({ message: "Break ended", record: populatedRecord });
  } catch (error) {
    console.error("Break Out Error:", error.message);
    res.status(500).json({ message: error.message || "Error ending break" });
  }
};

export const checkOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getToday();

    const record = await Attendance.findOne({ userId, date: today });
    if (!record || record.status === "CHECKED_OUT") {
      return res.status(400).json({ message: "Cannot check out" });
    }

    record.checkOut = new Date();
    record.status = "CHECKED_OUT";
    await record.save();

    const populatedRecord = await Attendance.findById(record._id).populate(
      "userId",
      "email name _id",
    );

    res.json({ message: "Checked out successfully", record: populatedRecord });
  } catch (error) {
    console.error("Check Out Error:", error.message);
    res.status(500).json({ message: error.message || "Error checking out" });
  }
};

export const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user?._id;
    const today = getToday();

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const record = await Attendance.findOne({ userId, date: today }).populate(
      "userId",
      "email name _id",
    );

    if (!record) {
      return res.json({ status: "NOT_CHECKED_IN" });
    }
    res.json({ status: record.status, record });
  } catch (error) {
    res.status(500).json({ message: "Error fetching status", error });
  }
};

export const getAttendanceByDate = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    const userId = req.user._id;

    // If startDate and endDate are provided, use date range query
    if (startDate && endDate) {
      const filter = {
        userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      const records = await Attendance.find(filter)
        .populate("userId", "email name _id")
        .sort({ date: 1 });

      return res.json(records);
    }

    // Otherwise, use single date query
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const records = await Attendance.find({ date, userId }).populate(
      "userId",
      "email name _id",
    );

    res.json(records);
  } catch (error) {
    console.error("Get Attendance Error:", error.message);
    res
      .status(500)
      .json({ message: error.message || "Error fetching attendance" });
  }
};

export const getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    let filter = { userId };

    if (startDate && endDate) {
      filter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const attendance = await Attendance.find(filter)
      .populate("userId", "email name _id")
      .sort({ date: 1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// HR Admin: Get all users' attendance
export const getAllUsersAttendance = async (req, res) => {
  try {
    console.log(
      "[GET ALL ATTENDANCE] User:",
      req.user?.email,
      "Role:",
      req.user?.role?.name,
    );

    const { startDate, endDate, date } = req.query;

    let filter = {};

    // Single date filter
    if (date) {
      filter.date = date;
    }
    // Date range filter
    else if (startDate && endDate) {
      filter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const attendance = await Attendance.find(filter)
      .populate({
        path: "userId",
        select: "name email _id",
        populate: {
          path: "role department",
          select: "name",
        },
      })
      .sort({ date: -1, createdAt: -1 });

    console.log("[GET ALL ATTENDANCE] Found records:", attendance.length);
    res.json(attendance);
  } catch (error) {
    console.error("Get All Users Attendance Error:", error.message);
    res
      .status(500)
      .json({ message: error.message || "Error fetching attendance" });
  }
};

// HR Admin: Update attendance record (complete missing actions)
export const updateAttendanceRecord = async (req, res) => {
  try {
    console.log(
      "[UPDATE ATTENDANCE] User:",
      req.user?.email,
      "Role:",
      req.user?.role?.name,
    );
    console.log("[UPDATE ATTENDANCE] Record ID:", req.params.id);
    console.log("[UPDATE ATTENDANCE] Body:", req.body);

    const { id } = req.params;
    const { checkOut, breakIn, breakOut } = req.body;

    const record = await Attendance.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Update checkOut if provided
    if (checkOut !== undefined) {
      if (checkOut === null) {
        record.checkOut = null;
        record.status = "CHECKED_IN";
      } else {
        record.checkOut = new Date(checkOut);
        record.status = "CHECKED_OUT";
      }
    }

    // Add or update break
    if (breakIn !== undefined || breakOut !== undefined) {
      if (breakIn && !breakOut) {
        // Add new break-in
        record.breaks.push({ breakIn: new Date(breakIn) });
        record.status = "ON_BREAK";
      } else if (breakIn && breakOut) {
        // Add complete break
        record.breaks.push({
          breakIn: new Date(breakIn),
          breakOut: new Date(breakOut),
        });
        if (!record.checkOut) {
          record.status = "BACK_TO_WORK";
        }
      }
    }

    await record.save();

    const updatedRecord = await Attendance.findById(record._id).populate({
      path: "userId",
      select: "name email _id",
      populate: {
        path: "role department",
        select: "name",
      },
    });

    console.log("[UPDATE ATTENDANCE] Success");
    res.json({
      message: "Attendance updated successfully",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Update Attendance Error:", error.message);
    res
      .status(500)
      .json({ message: error.message || "Error updating attendance" });
  }
};

// HR Admin: Complete missing break-out
export const completeBreakOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { breakIndex, breakOut } = req.body;

    const record = await Attendance.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (breakIndex === undefined || !record.breaks[breakIndex]) {
      return res.status(400).json({ message: "Invalid break index" });
    }

    // Update the specific break
    record.breaks[breakIndex].breakOut = new Date(breakOut);

    // Update status if not checked out
    if (!record.checkOut) {
      record.status = "BACK_TO_WORK";
    }

    await record.save();

    const updatedRecord = await Attendance.findById(record._id).populate({
      path: "userId",
      select: "name email _id",
      populate: {
        path: "role department",
        select: "name",
      },
    });

    res.json({
      message: "Break completed successfully",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Complete Break Out Error:", error.message);
    res
      .status(500)
      .json({ message: error.message || "Error completing break" });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    const records = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const REQUIRED_DAILY_HOURS = 8.5;

    let totalDays = 0;
    let present = 0;
    let absent = 0;
    let late = 0;
    let halfDay = 0;
    let totalWorkMinutes = 0;

    for (const r of records) {
      totalDays++;

      if (!r.checkIn) {
        absent++;
        continue;
      }

      present++;

      const checkInHour = new Date(r.checkIn).getHours();
      const checkInMin = new Date(r.checkIn).getMinutes();

      if (checkInHour > 9 || (checkInHour === 9 && checkInMin > 30)) {
        late++;
      }



    }

    const totalWorkHours = (totalWorkMinutes / 60).toFixed(1);

    const totalOfficeHours = present * REQUIRED_DAILY_HOURS;

    
    const productivity = totalOfficeHours
      ? ((totalWorkHours / totalOfficeHours) * 100).toFixed(0)
      : 0;

    res.json({
      totalDays,
      present,
      absent,
      late,
      halfDay,
      totalOffice: present,
      totalWorkHours,
      totalOfficeHours, 
      productivity,
      leaves: totalDays - present,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
