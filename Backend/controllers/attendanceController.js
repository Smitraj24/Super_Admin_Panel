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
    const { date } = req.query;
    const userId = req.user._id;

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
